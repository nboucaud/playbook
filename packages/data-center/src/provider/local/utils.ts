import { createBlocksuiteWorkspace } from '../../utils';
import type { WorkspaceUnitCtorParams } from '../../workspace-unit';
import { WorkspaceUnit } from '../../workspace-unit';
import { setDefaultAvatar } from '../utils';
import { applyLocalUpdates, writeUpdatesToLocal } from './indexeddb/utils';

export const loadWorkspaceUnit = async (params: WorkspaceUnitCtorParams) => {
  const workspaceUnit = new WorkspaceUnit(params);

  const blocksuiteWorkspace = createBlocksuiteWorkspace(workspaceUnit.id, {
    blobOptionsGetter: (k: string) => undefined,
  });

  await applyLocalUpdates(blocksuiteWorkspace);

  workspaceUnit.setBlocksuiteWorkspace(blocksuiteWorkspace);

  return workspaceUnit;
};

export const createWorkspaceUnit = async (params: WorkspaceUnitCtorParams) => {
  const workspaceUnit = new WorkspaceUnit(params);

  const blocksuiteWorkspace = createBlocksuiteWorkspace(workspaceUnit.id, {
    blobOptionsGetter: (k: string) => undefined,
  });
  blocksuiteWorkspace.meta.setName(workspaceUnit.name);
  if (!workspaceUnit.avatar) {
    try {
      await setDefaultAvatar(blocksuiteWorkspace);
      workspaceUnit.update({ avatar: blocksuiteWorkspace.meta.avatar });
    } catch (err) {
      // fixme(himself65): test environment not exist
      console.warn('set default avatar error', err);
    }
  }
  if (typeof window !== 'undefined') {
    await writeUpdatesToLocal(blocksuiteWorkspace);
  }

  workspaceUnit.setBlocksuiteWorkspace(blocksuiteWorkspace);

  return workspaceUnit;
};
