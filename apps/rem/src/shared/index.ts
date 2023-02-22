import { Workspace as RemoteWorkspace } from '@affine/datacenter';
import { __unstableSchemas, builtInSchemas } from '@blocksuite/blocks/models';
import { Workspace as BlockSuiteWorkspace } from '@blocksuite/store';

import { createAffineProviders } from '../blocksuite';
import { apis } from './apis';

export { BlockSuiteWorkspace };

export interface WorkspaceHandler {
  syncBinary: () => Promise<void>;
}

export interface AffineRemoteSyncedWorkspace
  extends RemoteWorkspace,
    WorkspaceHandler {
  flavour: 'affine';
  firstBinarySynced: true;
  blockSuiteWorkspace: BlockSuiteWorkspace;
  providers: Provider[];
}

export interface AffineRemoteUnSyncedWorkspace
  extends RemoteWorkspace,
    WorkspaceHandler {
  flavour: 'affine';
  firstBinarySynced: false;
}

export interface LocalWorkspace extends WorkspaceHandler {
  flavour: 'local';
  id: string;
  blockSuiteWorkspace: BlockSuiteWorkspace;
  providers: Provider[];
}

export const transformToAffineSyncedWorkspace = (
  unSyncedWorkspace: AffineRemoteUnSyncedWorkspace,
  binary: ArrayBuffer
): AffineRemoteSyncedWorkspace => {
  const blockSuiteWorkspace = new BlockSuiteWorkspace({
    room: unSyncedWorkspace.id,
  })
    .register(builtInSchemas)
    .register(__unstableSchemas);
  BlockSuiteWorkspace.Y.applyUpdate(
    blockSuiteWorkspace.doc,
    new Uint8Array(binary)
  );
  return {
    ...unSyncedWorkspace,
    blockSuiteWorkspace,
    firstBinarySynced: true,
    providers: [...createAffineProviders(blockSuiteWorkspace)],
  };
};

export type BaseProvider = {
  flavour: string;
  connect: () => void;
  disconnect: () => void;
};

export interface LocalProvider extends BaseProvider {
  flavour: 'local';
}

export interface AffineProvider extends BaseProvider {
  flavour: 'affine';
}

export type Provider = LocalProvider | AffineProvider;

export interface PersistenceWorkspace extends RemoteWorkspace {
  flavour: 'affine' | 'local';
  providers: Provider['flavour'][];
}

export const transformToJSON = (
  workspace: RemWorkspace
): PersistenceWorkspace => {
  // fixme
  return null!;
};

export const fromJSON = (json: PersistenceWorkspace): RemWorkspace => {
  // fixme
  return null!;
};

export type RemWorkspace =
  | LocalWorkspace
  | AffineRemoteUnSyncedWorkspace
  | AffineRemoteSyncedWorkspace;

export const fetcher = (query: string) => {
  if (query === 'getUser') {
    return apis.auth.user ?? null;
  }
  return (apis as any)[query]();
};

export const QueryKey = {
  getUser: 'getUser',
  getWorkspaces: 'getWorkspaces',
} as const;
