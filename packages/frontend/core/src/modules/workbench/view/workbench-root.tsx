import { AffineErrorComponent } from '@affine/core/components/affine/affine-error-boundary/affine-error-fallback';
import { workbenchRoutes } from '@affine/core/desktop/workbench-router';
import { useLiveData, useService } from '@toeverything/infra';
import { memo, useCallback, useEffect, useRef } from 'react';
import { type RouteObject, useLocation } from 'react-router-dom';

import type { View } from '../entities/view';
import { WorkbenchService } from '../services/workbench';
import { useBindWorkbenchToBrowserRouter } from './browser-adapter';
import { useBindWorkbenchToDesktopRouter } from './desktop-adapter';
import { RouteContainer } from './route-container';
import { SplitView } from './split-view/split-view';
import { ViewIslandRegistryProvider } from './view-islands';
import { ViewRoot } from './view-root';
import * as styles from './workbench-root.css';

const useAdapter = BUILD_CONFIG.isElectron
  ? useBindWorkbenchToDesktopRouter
  : useBindWorkbenchToBrowserRouter;

const routes: RouteObject[] = [
  {
    element: <RouteContainer />,
    errorElement: <AffineErrorComponent />,
    children: workbenchRoutes,
  },
];

export const WorkbenchRoot = memo(() => {
  const workbench = useService(WorkbenchService).workbench;

  // for debugging
  (window as any).workbench = workbench;

  const views = useLiveData(workbench.views$);

  const location = useLocation();
  const basename = location.pathname.match(/\/workspace\/[^/]+/g)?.[0] ?? '/';

  useAdapter(workbench, basename);

  const panelRenderer = useCallback((view: View, index: number) => {
    return <WorkbenchView key={view.id} view={view} index={index} />;
  }, []);

  const onMove = useCallback(
    (from: number, to: number) => {
      workbench.moveView(from, to);
    },
    [workbench]
  );

  useEffect(() => {
    workbench.updateBasename(basename);
  }, [basename, workbench]);

  return (
    <ViewIslandRegistryProvider>
      <SplitView
        className={styles.workbenchRootContainer}
        views={views}
        renderer={panelRenderer}
        onMove={onMove}
      />
    </ViewIslandRegistryProvider>
  );
});

WorkbenchRoot.displayName = 'memo(WorkbenchRoot)';

const WorkbenchView = ({ view, index }: { view: View; index: number }) => {
  const workbench = useService(WorkbenchService).workbench;

  const handleOnFocus = useCallback(() => {
    workbench.active(index);
  }, [workbench, index]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const element = containerRef.current;
      element.addEventListener('pointerdown', handleOnFocus, {
        capture: true,
      });
      return () => {
        element.removeEventListener('pointerdown', handleOnFocus, {
          capture: true,
        });
      };
    }
    return;
  }, [handleOnFocus]);

  return (
    <div className={styles.workbenchViewContainer} ref={containerRef}>
      <ViewRoot routes={routes} key={view.id} view={view} />
    </div>
  );
};
