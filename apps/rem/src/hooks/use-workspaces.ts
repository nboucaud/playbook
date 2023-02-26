import { Workspace } from '@affine/datacenter';
import { uuidv4 } from '@blocksuite/store';
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import useSWR from 'swr';
import { IndexeddbPersistence } from 'y-indexeddb';

import { createLocalProviders } from '../blocksuite';
import { UIPlugins } from '../plugins';
import { QueryKey } from '../plugins/affine/fetcher';
import { kStoreKey } from '../plugins/local';
import { LocalWorkspace, RemWorkspace, RemWorkspaceFlavour } from '../shared';
import { config } from '../shared/env';
import { createEmptyBlockSuiteWorkspace } from '../utils';

export const dataCenter = {
  workspaces: [] as RemWorkspace[],
  isLoaded: false,
  callbacks: new Set<() => void>(),
};

export function vitestRefreshWorkspaces() {
  dataCenter.workspaces = [];
  dataCenter.callbacks.clear();
}

declare global {
  // eslint-disable-next-line no-var
  var dataCenter: {
    workspaces: RemWorkspace[];
    isLoaded: boolean;
    callbacks: Set<() => void>;
  };
}

globalThis.dataCenter = dataCenter;

function createRemLocalWorkspace(name: string) {
  const id = uuidv4();
  const blockSuiteWorkspace = createEmptyBlockSuiteWorkspace(id);
  blockSuiteWorkspace.meta.setName(name);
  const workspace: LocalWorkspace = {
    flavour: RemWorkspaceFlavour.LOCAL,
    blockSuiteWorkspace: blockSuiteWorkspace,
    providers: [...createLocalProviders(blockSuiteWorkspace)],
    syncBinary: async () => {
      if (!config.enableIndexedDBProvider) {
        return {
          ...workspace,
        };
      }
      const persistence = new IndexeddbPersistence(
        blockSuiteWorkspace.room as string,
        blockSuiteWorkspace.doc
      );
      return persistence.whenSynced.then(() => {
        persistence.destroy();
        return {
          ...workspace,
        };
      });
    },
    id,
  };
  if (config.enableIndexedDBProvider) {
    let ids: string[];
    try {
      ids = JSON.parse(localStorage.getItem(kStoreKey) ?? '[]');
      if (!Array.isArray(ids)) {
        localStorage.setItem(kStoreKey, '[]');
        ids = [];
      }
    } catch (e) {
      localStorage.setItem(kStoreKey, '[]');
      ids = [];
    }
    ids.push(id);
    localStorage.setItem(kStoreKey, JSON.stringify(ids));
  }
  dataCenter.workspaces = [...dataCenter.workspaces, workspace];
  dataCenter.callbacks.forEach(cb => cb());
  return id;
}

const emptyWorkspaces: RemWorkspace[] = [];

export async function prefetchNecessaryData(signal?: AbortSignal) {
  if (!config.prefetchWorkspace) {
    console.info('prefetchNecessaryData: skip prefetching');
    return;
  }
  const plugins = Object.values(UIPlugins).sort(
    (a, b) => a.loadPriority - b.loadPriority
  );
  // prefetch data in order
  for (const plugin of plugins) {
    console.info('prefetchNecessaryData: plugin', plugin.flavour);
    try {
      if (signal?.aborted) {
        break;
      }
      const oldData = dataCenter.workspaces;
      await plugin.prefetchData(dataCenter, signal);
      const newData = dataCenter.workspaces;
      if (!Object.is(oldData, newData)) {
        console.info('prefetchNecessaryData: data changed');
        dataCenter.callbacks.forEach(cb => cb());
      }
    } catch (e) {
      console.error('error prefetch data', plugin.flavour, e);
    }
  }
  dataCenter.isLoaded = true;
  dataCenter.callbacks.forEach(cb => cb());
}

export function useWorkspaces(): RemWorkspace[] {
  return useSyncExternalStore(
    useCallback(onStoreChange => {
      dataCenter.callbacks.add(onStoreChange);
      return () => {
        dataCenter.callbacks.delete(onStoreChange);
      };
    }, []),
    useCallback(() => dataCenter.workspaces, []),
    useCallback(() => emptyWorkspaces, [])
  );
}

export function useWorkspacesIsLoaded(): boolean {
  return useSyncExternalStore(
    useCallback(onStoreChange => {
      dataCenter.callbacks.add(onStoreChange);
      return () => {
        dataCenter.callbacks.delete(onStoreChange);
      };
    }, []),
    useCallback(() => dataCenter.isLoaded, []),
    useCallback(() => true, [])
  );
}

export function useSyncWorkspaces() {
  return useSWR<Workspace[]>(QueryKey.getWorkspaces, {
    fallbackData: [],
    revalidateOnReconnect: true,
    revalidateOnFocus: false,
    revalidateOnMount: true,
    revalidateIfStale: false,
  });
}

export function useWorkspacesHelper() {
  return useMemo(
    () => ({
      createWorkspacePage: (workspaceId: string, pageId: string) => {
        const workspace = dataCenter.workspaces.find(
          ws => ws.id === workspaceId
        ) as LocalWorkspace;
        if (workspace && 'blockSuiteWorkspace' in workspace) {
          workspace.blockSuiteWorkspace.createPage(pageId);
        } else {
          throw new Error('cannot create page. blockSuiteWorkspace not found');
        }
      },
      createRemLocalWorkspace,
    }),
    []
  );
}
