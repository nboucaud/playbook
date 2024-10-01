import { openSettingModalAtom } from '@affine/core/components/atoms';
import { useAsyncCallback } from '@affine/core/components/hooks/affine-async-hooks';
import {
  AddPageButton,
  AppSidebar,
  CategoryDivider,
  MenuItem,
  MenuLinkItem,
  QuickSearchInput,
  SidebarContainer,
  SidebarScrollableContainer,
} from '@affine/core/modules/app-sidebar/views';
import {
  ExplorerCollections,
  ExplorerFavorites,
  ExplorerMigrationFavorites,
  ExplorerOrganize,
} from '@affine/core/modules/explorer';
import { ExplorerTags } from '@affine/core/modules/explorer/views/sections/tags';
import { CMDKQuickSearchService } from '@affine/core/modules/quicksearch/services/cmdk';
import { isNewTabTrigger } from '@affine/core/utils';
import { apis, events } from '@affine/electron-api';
import { useI18n } from '@affine/i18n';
import { track } from '@affine/track';
import type { Doc } from '@blocksuite/affine/store';
import { AllDocsIcon, PenIcon, SettingsIcon } from '@blocksuite/icons/rc';
import type { Workspace } from '@toeverything/infra';
import {
  useLiveData,
  useServices,
  WorkspaceService,
} from '@toeverything/infra';
import { useSetAtom } from 'jotai';
import type { MouseEvent, ReactElement } from 'react';
import { useCallback, useEffect } from 'react';

import { WorkbenchService } from '../../modules/workbench';
import Logo from '../affine/onboarding/assets/logo';
import type { ActiveTab } from '../affine/setting-modal/types';
import { usePageHelper } from '../blocksuite/block-suite-page-list/utils';
import ImportPage from './import-page';
import {
  quickSearch,
  quickSearchAndNewPage,
  workspaceAndUserWrapper,
} from './index.css';
import { AppSidebarJournalButton } from './journal-button';
import { TrashButton } from './trash-button';

export type RootAppSidebarProps = {
  isPublicWorkspace: boolean;
  onOpenQuickSearchModal: () => void;
  onOpenSettingModal: () => void;
  currentWorkspace: Workspace;
  openPage: (pageId: string) => void;
  createPage: () => Doc;
  paths: {
    all: (workspaceId: string) => string;
    trash: (workspaceId: string) => string;
    shared: (workspaceId: string) => string;
  };
};

/**
 * This is for the whole affine app sidebar.
 * This component wraps the app sidebar in `@affine/component` with logic and data.
 *
 */
export const RootAppSidebar = (): ReactElement => {
  const { workbenchService, workspaceService, cMDKQuickSearchService } =
    useServices({
      WorkspaceService,
      WorkbenchService,
      CMDKQuickSearchService,
    });
  const currentWorkspace = workspaceService.workspace;
  const docCollection = currentWorkspace.docCollection;
  const t = useI18n();
  const workbench = workbenchService.workbench;
  const currentPath = useLiveData(
    workbench.location$.map(location => location.pathname)
  );
  const onOpenQuickSearchModal = useCallback(() => {
    cMDKQuickSearchService.toggle();
  }, [cMDKQuickSearchService]);

  const allPageActive = currentPath === '/all';

  const pageHelper = usePageHelper(currentWorkspace.docCollection);

  const onClickNewPage = useAsyncCallback(
    async (e?: MouseEvent) => {
      pageHelper.createPage(undefined, isNewTabTrigger(e) ? 'new-tab' : true);
      track.$.navigationPanel.$.createDoc();
    },
    [pageHelper]
  );

  useEffect(() => {
    if (BUILD_CONFIG.isElectron) {
      return events?.applicationMenu.onNewPageAction(() => {
        apis?.ui
          .isActiveTab()
          .then(isActive => {
            if (!isActive) {
              return;
            }
            onClickNewPage();
          })
          .catch(err => {
            console.error(err);
          });
      });
    }
    return;
  }, [onClickNewPage]);

  const setOpenSettingModalAtom = useSetAtom(openSettingModalAtom);

  const onOpenSettingModal = useCallback(
    (active?: ActiveTab) => {
      setOpenSettingModalAtom({
        activeTab: active ? active : 'appearance',
        open: true,
      });
      track.$.navigationPanel.$.openSettings();
    },
    [setOpenSettingModalAtom]
  );

  return (
    <AppSidebar>
      <SidebarContainer>
        <div className={workspaceAndUserWrapper}>
          {/* <div className={workspaceWrapper}>
            <WorkspaceNavigator
              showEnableCloudButton
              showSettingsButton
              showSyncStatus
            />
          </div> */}
          {/* <UserInfo /> */}
        </div>
        <div className={quickSearchAndNewPage}>
          <QuickSearchInput
            className={quickSearch}
            data-testid="slider-bar-quick-search-button"
            data-event-props="$.navigationPanel.$.quickSearch"
            onClick={onOpenQuickSearchModal}
          />
          <AddPageButton onClick={onClickNewPage} />
        </div>
        <MenuLinkItem icon={<AllDocsIcon />} active={allPageActive} to={'/all'}>
          <span data-testid="all-pages">
            {t['com.affine.workspaceSubPath.all']()}
          </span>
        </MenuLinkItem>
        <AppSidebarJournalButton
          docCollection={currentWorkspace.docCollection}
        />
        <MenuItem
          data-testid="slider-bar-workspace-setting-button"
          icon={<SettingsIcon />}
          onClick={() => onOpenSettingModal()}
        >
          <span data-testid="settings-modal-trigger">
            {t['com.affine.settingSidebar.title']()}
          </span>
        </MenuItem>
        <MenuItem
          data-testid="slider-bar-workspace-setting-button"
          icon={<PenIcon />}
          onClick={() => onOpenSettingModal('editor')}
        >
          <span data-testid="settings-modal-trigger">
            {t['com.affine.settings.editorSettings']()}
          </span>
        </MenuItem>
      </SidebarContainer>
      <SidebarScrollableContainer>
        <ExplorerFavorites />
        <ExplorerOrganize />
        <ExplorerMigrationFavorites />
        <ExplorerCollections />
        <ExplorerTags />
        <CategoryDivider label={t['com.affine.rootAppSidebar.others']()} />
        <div style={{ padding: '0 8px' }}>
          <TrashButton />
          <ImportPage docCollection={docCollection} />
        </div>
      </SidebarScrollableContainer>
      <SidebarContainer>
        <div style={{ width: 'fit-content' }}>
          <Logo />
        </div>
      </SidebarContainer>
    </AppSidebar>
  );
};

RootAppSidebar.displayName = 'memo(RootAppSidebar)';
