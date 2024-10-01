import { AffineErrorBoundary } from '@affine/core/components/affine/affine-error-boundary';
import { useLiveData, useService } from '@toeverything/infra';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AppSidebarService } from '../../app-sidebar';
import { SidebarSwitch } from '../../app-sidebar/views';
import { ViewService } from '../services/view';
import * as styles from './route-container.css';
import { useViewPosition } from './use-view-position';
import { ViewBodyTarget, ViewHeaderTarget } from './view-islands';

export interface Props {
  route: {
    Component: React.ComponentType;
  };
}

export const RouteContainer = () => {
  const viewPosition = useViewPosition();
  const appSidebarService = useService(AppSidebarService).sidebar;
  const leftSidebarOpen = useLiveData(appSidebarService.open$);
  const view = useService(ViewService).view;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        {!BUILD_CONFIG.isElectron && viewPosition.isFirst && (
          <SidebarSwitch
            show={!leftSidebarOpen}
            className={styles.leftSidebarButton}
          />
        )}
        <ViewHeaderTarget
          viewId={view.id}
          className={styles.viewHeaderContainer}
        />
      </div>

      <AffineErrorBoundary>
        <Suspense>
          <Outlet />
        </Suspense>
      </AffineErrorBoundary>
      <ViewBodyTarget viewId={view.id} className={styles.viewBodyContainer} />
    </div>
  );
};
