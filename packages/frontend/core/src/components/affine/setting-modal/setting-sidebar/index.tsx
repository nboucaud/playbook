import { Avatar } from '@affine/component/ui/avatar';
import { AuthService } from '@affine/core/modules/cloud';
import { useI18n } from '@affine/i18n';
import { track } from '@affine/track';
import { Logo1Icon } from '@blocksuite/icons/rc';
import type { WorkspaceMetadata } from '@toeverything/infra';
import { useLiveData, useService } from '@toeverything/infra';
import clsx from 'clsx';
import { useSetAtom } from 'jotai/react';
import { type MouseEvent, Suspense, useCallback } from 'react';

import { authAtom } from '../../../atoms';
import { UserPlanButton } from '../../auth/user-plan-button';
import { useGeneralSettingList } from '../general-setting';
import type { ActiveTab } from '../types';
import * as style from './style.css';

export type UserInfoProps = {
  onAccountSettingClick: () => void;
  active?: boolean;
};

export const UserInfo = ({ onAccountSettingClick, active }: UserInfoProps) => {
  const account = useLiveData(useService(AuthService).session.account$);
  if (!account) {
    // TODO(@eyhn): loading ui
    return;
  }
  return (
    <div
      data-testid="user-info-card"
      className={clsx(style.accountButton, {
        active: active,
      })}
      onClick={onAccountSettingClick}
    >
      <Avatar
        size={28}
        rounded={2}
        name={account.label}
        url={account.avatar}
        className="avatar"
      />

      <div className="content">
        <div className="name-container">
          <div className="name" title={account.label}>
            {account.label}
          </div>
          <UserPlanButton />
        </div>

        <div className="email" title={account.email}>
          {account.email}
        </div>
      </div>
    </div>
  );
};

export const SignInButton = () => {
  const t = useI18n();
  const setAuthModal = useSetAtom(authAtom);

  return (
    <div
      className={style.accountButton}
      onClick={useCallback(() => {
        setAuthModal({ openModal: true, state: 'signIn' });
      }, [setAuthModal])}
    >
      <div className="avatar not-sign">
        <Logo1Icon />
      </div>

      <div className="content">
        <div className="name" title={t['com.affine.settings.sign']()}>
          {t['com.affine.settings.sign']()}
        </div>
        <div className="email" title={t['com.affine.setting.sign.message']()}>
          {t['com.affine.setting.sign.message']()}
        </div>
      </div>
    </div>
  );
};

export const SettingSidebar = ({
  activeTab,
  onTabChange,
}: {
  activeTab: ActiveTab;
  onTabChange: (
    key: ActiveTab,
    workspaceMetadata: WorkspaceMetadata | null
  ) => void;
}) => {
  const t = useI18n();
  const loginStatus = useLiveData(useService(AuthService).session.status$);
  const generalList = useGeneralSettingList();
  const gotoTab = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const tab = e.currentTarget.dataset.eventArg;
      if (!tab) return;
      track.$.settingsPanel.menu.openSettings({ to: tab });
      onTabChange(tab as ActiveTab, null);
    },
    [onTabChange]
  );
  const onAccountSettingClick = useCallback(() => {
    track.$.settingsPanel.menu.openSettings({ to: 'account' });
    onTabChange('account', null);
  }, [onTabChange]);

  return (
    <div className={style.settingSlideBar} data-testid="settings-sidebar">
      <div className={style.sidebarTitle}>
        {t['com.affine.settingSidebar.title']()}
      </div>
      <div className={style.sidebarSubtitle}>
        {t['com.affine.settingSidebar.settings.general']()}
      </div>
      <div className={style.sidebarItemsWrapper}>
        {generalList.map(({ title, icon, key, testId }) => {
          return (
            <div
              className={clsx(style.sidebarSelectItem, {
                active: key === activeTab,
              })}
              key={key}
              title={title}
              data-event-arg={key}
              onClick={gotoTab}
              data-testid={testId}
            >
              {icon({ className: 'icon' })}
              <span className="setting-name">{title}</span>
            </div>
          );
        })}
      </div>

      <div className={clsx(style.sidebarItemsWrapper, 'scroll')} />

      <div className={style.sidebarFooter}>
        {loginStatus === 'authenticated' ? (
          <Suspense>
            <UserInfo
              onAccountSettingClick={onAccountSettingClick}
              active={activeTab === 'account'}
            />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
};
