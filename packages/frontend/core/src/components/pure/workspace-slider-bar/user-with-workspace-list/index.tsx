import { Divider } from '@affine/component/ui/divider';
import { MenuItem } from '@affine/component/ui/menu';
import { useAFFiNEI18N } from '@affine/i18n/hooks';
import { Logo1Icon } from '@blocksuite/icons';
import { AuthenticationManager, WorkspaceManager } from '@toeverything/infra';
import { useService } from '@toeverything/infra/di';
import { useLiveData } from '@toeverything/infra/livedata';
import { useSetAtom } from 'jotai';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useCallback, useMemo } from 'react';

import {
  authAtom,
  openCreateWorkspaceModalAtom,
  openDisableCloudAlertModalAtom,
} from '../../../../atoms';
import { AddWorkspace } from './add-workspace';
import * as styles from './index.css';
import { UserAccountItem } from './user-account';
import { AFFiNEWorkspaceList } from './workspace-list';

const SignInItem = () => {
  const setDisableCloudOpen = useSetAtom(openDisableCloudAlertModalAtom);

  const setOpen = useSetAtom(authAtom);

  const t = useAFFiNEI18N();

  const onClickSignIn = useCallback(() => {
    if (!runtimeConfig.enableCloud) {
      setDisableCloudOpen(true);
    } else {
      setOpen(state => ({
        ...state,
        openModal: true,
      }));
    }
  }, [setOpen, setDisableCloudOpen]);

  return (
    <MenuItem
      className={styles.menuItem}
      onClick={onClickSignIn}
      data-testid="cloud-signin-button"
    >
      <div className={styles.signInWrapper}>
        <div className={styles.iconContainer}>
          <Logo1Icon />
        </div>

        <div className={styles.signInTextContainer}>
          <div className={styles.signInTextPrimary}>
            {t['com.affine.workspace.cloud.auth']()}
          </div>
          <div className={styles.signInTextSecondary}>
            {t['com.affine.workspace.cloud.description']()}
          </div>
        </div>
      </div>
    </MenuItem>
  );
};

export const UserWithWorkspaceList = ({
  onEventEnd,
}: {
  onEventEnd?: () => void;
}) => {
  const auth = useService(AuthenticationManager);
  const session = useLiveData(auth.session('affine-cloud'));

  const isAuthenticated = useMemo(
    () => session?.status === 'authenticated',
    [session]
  );

  const setOpenCreateWorkspaceModal = useSetAtom(openCreateWorkspaceModalAtom);

  const onNewWorkspace = useCallback(() => {
    setOpenCreateWorkspaceModal('new');
    onEventEnd?.();
  }, [onEventEnd, setOpenCreateWorkspaceModal]);

  const onAddWorkspace = useCallback(() => {
    setOpenCreateWorkspaceModal('add');
    onEventEnd?.();
  }, [onEventEnd, setOpenCreateWorkspaceModal]);

  const workspaceManager = useService(WorkspaceManager);
  const workspaces = useLiveData(workspaceManager.list.workspaceList);

  return (
    <div className={styles.workspaceListWrapper}>
      {isAuthenticated ? (
        <UserAccountItem
          email={
            (session?.status === 'authenticated'
              ? session.session.account.email
              : null) ?? 'Unknown User'
          }
          onEventEnd={onEventEnd}
        />
      ) : (
        <SignInItem />
      )}
      <Divider size="thinner" />
      <AFFiNEWorkspaceList onEventEnd={onEventEnd} />
      {workspaces.length > 0 ? <Divider size="thinner" /> : null}
      <AddWorkspace
        onAddWorkspace={onAddWorkspace}
        onNewWorkspace={onNewWorkspace}
      />
    </div>
  );
};
