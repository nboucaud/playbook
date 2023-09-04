import { WorkspaceFlavour } from '@affine/env/workspace';
import { rootWorkspacesMetadataAtom } from '@affine/workspace/atom';
import { assertExists } from '@blocksuite/global/utils';
import { getActiveBlockSuiteWorkspaceAtom } from '@toeverything/infra/__internal__/workspace';
import {
  currentPageIdAtom,
  currentWorkspaceIdAtom,
  getCurrentStore,
} from '@toeverything/infra/atom';
import type { ReactElement } from 'react';
import { type LoaderFunction, Outlet, redirect } from 'react-router-dom';

import { WorkspaceLayout } from '../../layouts/workspace-layout';

export const loader: LoaderFunction = async args => {
  const rootStore = getCurrentStore();
  const meta = await rootStore.get(rootWorkspacesMetadataAtom);
  const currentMetadata = meta.find(({ id }) => id === args.params.workspaceId);
  if (!currentMetadata) {
    return redirect('/404');
  }
  if (args.params.workspaceId) {
    localStorage.setItem('last_workspace_id', args.params.workspaceId);
    rootStore.set(currentWorkspaceIdAtom, args.params.workspaceId);
  }
  if (!args.params.pageId) {
    rootStore.set(currentPageIdAtom, null);
  }
  if (currentMetadata.flavour === WorkspaceFlavour.AFFINE_CLOUD) {
    const workspaceAtom = getActiveBlockSuiteWorkspaceAtom(currentMetadata.id);
    const workspace = await rootStore.get(workspaceAtom);
    const incompatible = (() => {
      const blockVersions = workspace.meta.blockVersions;
      assertExists(blockVersions, 'blockVersions should not be null');
      for (const [flavour, schema] of workspace.schema.flavourSchemaMap) {
        if (blockVersions[flavour] !== schema.version) {
          return true;
        }
      }
      return false;
    })();
    if (incompatible) {
      return redirect('/migration?workspace_id=' + args.params.workspaceId);
    }
  }
  return null;
};

export const Component = (): ReactElement => {
  return (
    <WorkspaceLayout>
      <Outlet />
    </WorkspaceLayout>
  );
};
