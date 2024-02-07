import { DebugLogger } from '@affine/debug';
import type { WorkspaceFlavour } from '@affine/env/workspace';
import type { Workspace as BlockSuiteWorkspace } from '@blocksuite/store';
import { combineLatest, map } from 'rxjs';

import { createIdentifier } from '../../di';
import { LiveData } from '../../livedata';
import type { GlobalCache } from '../../storage';
import type { BlobStorage } from '../engine';
import type { WorkspaceMetadata } from '../metadata';
import { type WorkspaceInfo, WorkspaceInformation } from './information';

export * from './information';

const logger = new DebugLogger('affine:workspace:list');

export interface WorkspaceListProvider {
  name: WorkspaceFlavour;

  /**
   * is workspace list reverifying, if true, UI can display loading indicator.
   */
  isReverifying: LiveData<boolean>;

  /**
   * get workspaces list
   */
  list: LiveData<WorkspaceMetadata[]>;

  /**
   * revalidate workspace list
   */
  revalidate(): void;

  /**
   * delete workspace by id
   */
  delete(workspaceId: string): Promise<void>;

  /**
   * create workspace
   * @param initial callback to put initial data to workspace
   */
  create(
    initial: (
      workspace: BlockSuiteWorkspace,
      blobStorage: BlobStorage
    ) => Promise<void>
  ): Promise<WorkspaceMetadata>;

  /**
   * get workspace avatar and name by id
   *
   * @param id workspace id
   */
  getInformation(id: string): Promise<WorkspaceInfo | undefined>;
}

export const WorkspaceListProvider = createIdentifier<WorkspaceListProvider>(
  'WorkspaceListProvider'
);

export interface WorkspaceListStatus {
  /**
   * is workspace list doing first loading.
   * if false, UI can display workspace not found page.
   */
  loading: boolean;
  workspaceList: WorkspaceMetadata[];
}

/**
 * # WorkspaceList
 *
 * manage multiple workspace metadata list providers.
 * provide a __cache-first__ and __offline useable__ workspace list.
 */
export class WorkspaceListService {
  private readonly abortController = new AbortController();

  private readonly workspaceInformationList = new Map<
    string,
    WorkspaceInformation
  >();

  workspaceList = LiveData.from(
    combineLatest(this.providers.map(p => p.list)).pipe(
      map(lists => lists.reduce((acc, list) => acc.concat(list), []))
    ),
    []
  );

  constructor(
    private readonly providers: WorkspaceListProvider[],
    private readonly cache: GlobalCache
  ) {}

  /**
   * create workspace
   * @param flavour workspace flavour
   * @param initial callback to put initial data to workspace
   * @returns workspace id
   */
  async create(
    flavour: WorkspaceFlavour,
    initial: (
      workspace: BlockSuiteWorkspace,
      blobStorage: BlobStorage
    ) => Promise<void> = () => Promise.resolve()
  ) {
    const provider = this.providers.find(x => x.name === flavour);
    if (!provider) {
      throw new Error(`Unknown workspace flavour: ${flavour}`);
    }
    const metadata = await provider.create(initial);
    return metadata;
  }

  /**
   * delete workspace
   * @param workspaceMetadata
   */
  async delete(workspaceMetadata: WorkspaceMetadata) {
    logger.info(
      `delete workspace [${workspaceMetadata.flavour}] ${workspaceMetadata.id}`
    );
    const provider = this.providers.find(
      x => x.name === workspaceMetadata.flavour
    );
    if (!provider) {
      throw new Error(
        `Unknown workspace flavour: ${workspaceMetadata.flavour}`
      );
    }
    await provider.delete(workspaceMetadata.id);
  }

  /**
   * callback for subscribe workspaces list
   */
  private handleWorkspaceChange(
    providerId: string,
    workspaces: WorkspaceMetadata[]
  ) {
    const newWorkspaces = [
      ...this.workspaceList.value.filter(x => x.flavour !== providerId),
      ...workspaces,
    ];

    this.workspaceList.next(newWorkspaces);
  }

  /**
   * get workspace information, if not exists, create it.
   */
  getInformation(meta: WorkspaceMetadata) {
    const exists = this.workspaceInformationList.get(meta.id);
    if (exists) {
      return exists;
    }

    return this.createInformation(meta);
  }

  private createInformation(workspaceMetadata: WorkspaceMetadata) {
    const provider = this.providers.find(
      x => x.name === workspaceMetadata.flavour
    );
    if (!provider) {
      throw new Error(
        `Unknown workspace flavour: ${workspaceMetadata.flavour}`
      );
    }
    const information = new WorkspaceInformation(
      workspaceMetadata,
      provider,
      this.cache
    );
    information.fetch();
    this.workspaceInformationList.set(workspaceMetadata.id, information);
    return information;
  }

  dispose() {
    this.abortController.abort();
  }
}
