import { Menu } from '@affine/component';
import { MenuItem } from '@affine/component/app-sidebar';
import {
  EditCollectionModel,
  useCollectionManager,
  useSavedCollections,
} from '@affine/component/page-list';
import type { Collection } from '@affine/env/filter';
import type { GetPageInfoById } from '@affine/env/page-info';
import { WorkspaceSubPath } from '@affine/env/workspace';
import { useAFFiNEI18N } from '@affine/i18n/hooks';
import {
  DeleteIcon,
  FilterIcon,
  InformationIcon,
  MoreHorizontalIcon,
  UnpinIcon,
  ViewLayersIcon,
} from '@blocksuite/icons';
import type { PageMeta, Workspace } from '@blocksuite/store';
import type { DragEndEvent } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import * as Collapsible from '@radix-ui/react-collapsible';
import { useBlockSuitePageMeta } from '@toeverything/hooks/use-block-suite-page-meta';
import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';

import { useGetPageInfoById } from '../../../../hooks/use-get-page-info';
import { useNavigateHelper } from '../../../../hooks/use-navigate-helper';
import { filterPage } from '../../../../utils/filter';
import type { CollectionsListProps } from '../index';
import { Page } from './page';
import * as styles from './styles.css';

const Collections_DROP_AREA_PREFIX = 'collections-';
const isCollectionsDropArea = (id?: string | number) => {
  return typeof id === 'string' && id.startsWith(Collections_DROP_AREA_PREFIX);
};
export const processCollectionsDrag = (e: DragEndEvent) => {
  if (
    isCollectionsDropArea(e.over?.id) &&
    String(e.active.id).startsWith('page-list-item-')
  ) {
    e.over?.data.current?.addToCollection?.(e.active.data.current?.pageId);
  }
};
const CollectionOperations = ({
  view,
  showUpdateCollection,
  setting,
}: {
  view: Collection;
  showUpdateCollection: () => void;
  setting: ReturnType<typeof useCollectionManager>;
}) => {
  const t = useAFFiNEI18N();
  const actions = useMemo<
    Array<
      | {
          icon: ReactElement;
          name: string;
          click: () => void;
          className?: string;
          element?: undefined;
        }
      | {
          element: ReactElement;
        }
    >
  >(
    () => [
      {
        icon: <FilterIcon />,
        name: t['Edit Filter'](),
        click: showUpdateCollection,
      },
      {
        icon: <UnpinIcon />,
        name: t['Unpin'](),
        click: () => {
          return setting.updateCollection({
            ...view,
            pinned: false,
          });
        },
      },
      {
        element: <div key="divider" className={styles.menuDividerStyle}></div>,
      },
      {
        icon: <DeleteIcon />,
        name: t['Delete'](),
        click: () => {
          return setting.deleteCollection(view.id);
        },
        className: styles.deleteFolder,
      },
    ],
    [setting, showUpdateCollection, t, view]
  );
  return (
    <div style={{ minWidth: 150 }}>
      {actions.map(action => {
        if (action.element) {
          return action.element;
        }
        return (
          <MenuItem
            data-testid="collection-option"
            key={action.name}
            className={action.className}
            icon={action.icon}
            onClick={action.click}
          >
            {action.name}
          </MenuItem>
        );
      })}
    </div>
  );
};
const CollectionRenderer = ({
  collection,
  pages,
  workspace,
  getPageInfo,
}: {
  collection: Collection;
  pages: PageMeta[];
  workspace: Workspace;
  getPageInfo: GetPageInfoById;
}) => {
  const [collapsed, setCollapsed] = React.useState(true);
  const setting = useCollectionManager(workspace.id);
  const { jumpToSubPath } = useNavigateHelper();
  const clickCollection = useCallback(() => {
    jumpToSubPath(workspace.id, WorkspaceSubPath.ALL);
    setting.selectCollection(collection.id);
  }, [jumpToSubPath, workspace.id, setting, collection.id]);
  const { setNodeRef, isOver } = useDroppable({
    id: `${Collections_DROP_AREA_PREFIX}${collection.id}`,
    data: {
      addToCollection: (id: string) => {
        setting.addPage(collection.id, id).catch(err => {
          console.error(err);
        });
      },
    },
  });
  const allPagesMeta = useMemo(
    () => Object.fromEntries(pages.map(v => [v.id, v])),
    [pages]
  );
  const [show, showUpdateCollection] = useState(false);
  const allowList = useMemo(
    () => new Set(collection.allowList),
    [collection.allowList]
  );
  const excludeList = useMemo(
    () => new Set(collection.excludeList),
    [collection.excludeList]
  );
  const removeFromAllowList = useCallback(
    (id: string) => {
      return setting.updateCollection({
        ...collection,
        allowList: collection.allowList?.filter(v => v != id),
      });
    },
    [collection, setting]
  );
  const addToExcludeList = useCallback(
    (id: string) => {
      return setting.updateCollection({
        ...collection,
        excludeList: [id, ...(collection.excludeList ?? [])],
      });
    },
    [collection, setting]
  );
  const pagesToRender = pages.filter(
    page => filterPage(collection, page) && !page.trash
  );
  return (
    <Collapsible.Root open={!collapsed}>
      <EditCollectionModel
        propertiesMeta={workspace.meta.properties}
        getPageInfo={getPageInfo}
        init={collection}
        onConfirm={setting.saveCollection}
        open={show}
        onClose={() => showUpdateCollection(false)}
      />
      <MenuItem
        data-testid="collection-item"
        data-type="collection-list-item"
        ref={setNodeRef}
        onCollapsedChange={setCollapsed}
        active={isOver}
        icon={<ViewLayersIcon />}
        postfix={
          <Menu
            trigger="click"
            placement="bottom-start"
            content={
              <CollectionOperations
                view={collection}
                showUpdateCollection={() => showUpdateCollection(true)}
                setting={setting}
              />
            }
          >
            <div data-testid="collection-options" className={styles.more}>
              <MoreHorizontalIcon></MoreHorizontalIcon>
            </div>
          </Menu>
        }
        collapsed={pagesToRender.length > 0 ? collapsed : undefined}
        onClick={clickCollection}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>{collection.name}</div>
        </div>
      </MenuItem>
      <Collapsible.Content>
        <div style={{ marginLeft: 8 }}>
          {pagesToRender.map(page => {
            return (
              <Page
                inAllowList={allowList.has(page.id)}
                removeFromAllowList={removeFromAllowList}
                inExcludeList={excludeList.has(page.id)}
                addToExcludeList={addToExcludeList}
                allPageMeta={allPagesMeta}
                page={page}
                key={page.id}
                workspace={workspace}
              />
            );
          })}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
export const CollectionsList = ({ workspace }: CollectionsListProps) => {
  const metas = useBlockSuitePageMeta(workspace);
  const { savedCollections } = useSavedCollections(workspace.id);
  const getPageInfo = useGetPageInfoById(workspace);
  const pinedCollections = useMemo(
    () => savedCollections.filter(v => v.pinned),
    [savedCollections]
  );
  if (pinedCollections.length === 0) {
    return (
      <MenuItem
        data-testid="slider-bar-collection-null-description"
        icon={<InformationIcon />}
        disabled
      >
        <span>Create a collection</span>
      </MenuItem>
    );
  }
  return (
    <div data-testid="collections" className={styles.wrapper}>
      {pinedCollections.map(view => {
        return (
          <CollectionRenderer
            getPageInfo={getPageInfo}
            key={view.id}
            collection={view}
            pages={metas}
            workspace={workspace}
          />
        );
      })}
    </div>
  );
};
