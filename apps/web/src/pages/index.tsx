import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { Suspense, useEffect } from 'react';

import { PageLoading } from '../components/pure/loading';
import { useSaveLastLeaveWorkspaceId } from '../hooks/affine/use-save-last-leave-workspace-id';
import { useCreateFirstWorkspace } from '../hooks/use-create-first-workspace';
import { useWorkspaces } from '../hooks/use-workspaces';

const IndexPageInner = () => {
  const router = useRouter();
  const workspaces = useWorkspaces();
  const { getSavedLastLeaveWorkspaceId } = useSaveLastLeaveWorkspaceId();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const lastWorkspaceId = getSavedLastLeaveWorkspaceId();
    const targetWorkspace =
      (lastWorkspaceId &&
        workspaces.find(({ id }) => id === lastWorkspaceId)) ||
      workspaces.at(0);

    if (targetWorkspace) {
      const pageId =
        targetWorkspace.blockSuiteWorkspace.meta.pageMetas.at(0)?.id;
      if (pageId) {
        router.replace({
          pathname: '/workspace/[workspaceId]/[pageId]',
          query: {
            workspaceId: targetWorkspace.id,
            pageId,
          },
        });
        return;
      } else {
        const clearId = setTimeout(() => {
          dispose.dispose();
          router.replace({
            pathname: '/workspace/[workspaceId]/all',
            query: {
              workspaceId: targetWorkspace.id,
            },
          });
        }, 1000);
        const dispose =
          targetWorkspace.blockSuiteWorkspace.slots.pageAdded.once(pageId => {
            clearTimeout(clearId);
            router.replace({
              pathname: '/workspace/[workspaceId]/[pageId]',
              query: {
                workspaceId: targetWorkspace.id,
                pageId,
              },
            });
          });
        return () => {
          clearTimeout(clearId);
          dispose.dispose();
        };
      }
    }
  }, [getSavedLastLeaveWorkspaceId, router, workspaces]);

  return <PageLoading />;
};

const IndexPage: NextPage = () => {
  useCreateFirstWorkspace();
  return (
    <Suspense fallback={<PageLoading />}>
      <IndexPageInner />
    </Suspense>
  );
};

export default IndexPage;
