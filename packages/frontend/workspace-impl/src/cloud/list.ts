import { DebugLogger } from '@affine/debug';
import { WorkspaceFlavour } from '@affine/env/workspace';
import {
  createWorkspaceMutation,
  deleteWorkspaceMutation,
  getWorkspacesQuery,
} from '@affine/graphql';
import { fetcher } from '@affine/graphql';
import { Workspace as BlockSuiteWorkspace } from '@blocksuite/store';
import type {
  AuthenticationManager,
  GlobalCache,
  WorkspaceListProvider,
} from '@toeverything/infra';
import {
  type BlobStorage,
  LiveData,
  type SyncStorage,
  type WorkspaceInfo,
  type WorkspaceMetadata,
} from '@toeverything/infra';
import { globalBlockSuiteSchema } from '@toeverything/infra';
import type { CleanupService } from '@toeverything/infra/lifecycle';
import { nanoid } from 'nanoid';
import {
  catchError,
  EMPTY,
  from,
  map,
  mergeWith,
  Subject,
  switchMap,
} from 'rxjs';
import { applyUpdate, encodeStateAsUpdate } from 'yjs';

import { IndexedDBBlobStorage } from '../local/blob-indexeddb';
import { SQLiteBlobStorage } from '../local/blob-sqlite';
import { IndexedDBSyncStorage } from '../local/sync-indexeddb';
import { SQLiteSyncStorage } from '../local/sync-sqlite';
import { AffineStaticSyncStorage } from './sync';

const logger = new DebugLogger('affine:cloud-workspace-list');

interface CacheData {
  userId: string;
  workspaces: WorkspaceMetadata[];
}

export class CloudWorkspaceListProvider implements WorkspaceListProvider {
  name = WorkspaceFlavour.AFFINE_CLOUD;

  constructor(
    private readonly auth: AuthenticationManager,
    private readonly cache: GlobalCache,
    cleanUp: CleanupService
  ) {
    const subscription = this.affineUser.subscribe(session => {
      const userId =
        session?.status === 'authenticated'
          ? session.session.account.id
          : undefined;
      const cached = this.cache.get<CacheData>('affine-cloud-workspaces')
        ?.userId;
      if (cached !== userId) {
        this.revalidate();
      }
    });

    cleanUp.add(() => {
      subscription.unsubscribe();
    });

    this.revalidate();
  }
  isReverifying = new LiveData(false);

  private readonly revalidateRequest$ = new Subject<void>();

  // @ts-expect-error never used
  private readonly revalidating = this.revalidateRequest$
    .pipe(mergeWith(this.auth.session('affine-cloud')))
    .pipe(
      switchMap(() =>
        from(this.getList()).pipe(
          catchError(err => {
            logger.warn('Failed to revalidate session, ' + err);
            return EMPTY;
          })
        )
      )
    )
    .subscribe(data => {
      if (data) {
        this.setList(data.userId, data.workspaces);
      } else {
        this.clearList();
      }
    });

  affineUser = LiveData.from(this.auth.session('affine-cloud'), undefined);

  list = LiveData.from(
    this.cache
      .watch<CacheData>('affine-cloud-workspaces')
      .pipe(map(x => x?.workspaces ?? [])),
    []
  );

  revalidate(): void {
    this.revalidateRequest.next();
  }

  private setList(userId: string, workspaces: WorkspaceMetadata[]) {
    this.cache.set('affine-cloud-workspaces', { userId, workspaces });
  }

  private clearList() {
    this.cache.set('affine-cloud-workspaces', null);
  }

  async getList() {
    if (this.affineUser.value?.status !== 'authenticated') {
      return;
    }
    const userId = this.affineUser.value.session.account.id;
    try {
      const { workspaces } = await fetcher({
        query: getWorkspacesQuery,
      });
      const ids = workspaces.map(({ id }) => id);
      return {
        userId,
        workspaces: ids.map(id => ({
          id,
          flavour: WorkspaceFlavour.AFFINE_CLOUD,
        })),
      };
    } catch (err) {
      if (err instanceof Array && err[0]?.message === 'Forbidden resource') {
        // user not logged in, tell auth manager to revalidate
        this.auth.revalidateSession('affine-cloud');
      }
      throw err;
    }
  }

  async delete(workspaceId: string): Promise<void> {
    await fetcher({
      query: deleteWorkspaceMutation,
      variables: {
        id: workspaceId,
      },
    });
    this.revalidate();
  }
  async create(
    initial: (
      workspace: BlockSuiteWorkspace,
      blobStorage: BlobStorage
    ) => Promise<void>
  ): Promise<WorkspaceMetadata> {
    const tempId = nanoid();

    const workspace = new BlockSuiteWorkspace({
      id: tempId,
      idGenerator: () => nanoid(),
      schema: globalBlockSuiteSchema,
    });

    // create workspace on cloud, get workspace id
    const {
      createWorkspace: { id: workspaceId },
    } = await fetcher({
      query: createWorkspaceMutation,
    });

    // save the initial state to local storage, then sync to cloud
    const blobStorage = environment.isDesktop
      ? new SQLiteBlobStorage(workspaceId)
      : new IndexedDBBlobStorage(workspaceId);
    const syncStorage = environment.isDesktop
      ? new SQLiteSyncStorage(workspaceId)
      : new IndexedDBSyncStorage(workspaceId);

    // apply initial state
    await initial(workspace, blobStorage);

    // save workspace to local storage, should be vary fast
    await syncStorage.push(workspaceId, encodeStateAsUpdate(workspace.doc));
    for (const subdocs of workspace.doc.getSubdocs()) {
      await syncStorage.push(subdocs.guid, encodeStateAsUpdate(subdocs));
    }

    this.revalidate();

    return { id: workspaceId, flavour: WorkspaceFlavour.AFFINE_CLOUD };
  }
  async getInformation(id: string): Promise<WorkspaceInfo | undefined> {
    // get information from both cloud and local storage

    // we use affine 'static' storage here, which use http protocol, no need to websocket.
    const cloudStorage: SyncStorage = new AffineStaticSyncStorage(id);
    const localStorage = environment.isDesktop
      ? new SQLiteSyncStorage(id)
      : new IndexedDBSyncStorage(id);
    // download root doc
    const localData = await localStorage.pull(id, new Uint8Array([]));
    let cloudData;
    try {
      cloudData = await cloudStorage.pull(id, new Uint8Array([]));
    } catch (err) {
      logger.warn('failed to pull from cloud storage', err);
    }

    if (!cloudData && !localData) {
      return;
    }

    const bs = new BlockSuiteWorkspace({
      id,
      schema: globalBlockSuiteSchema,
    });

    if (localData) applyUpdate(bs.doc, localData.data);
    if (cloudData) applyUpdate(bs.doc, cloudData.data);

    return {
      name: bs.meta.name,
      avatar: bs.meta.avatar,
    };
  }
}
