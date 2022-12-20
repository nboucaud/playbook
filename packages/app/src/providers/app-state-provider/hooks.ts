import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppState } from './context';

export const useLoadWorkspace = () => {
  const router = useRouter();
  const { loadWorkspace, currentWorkspace, currentWorkspaceId } = useAppState();

  const workspaceId = router.query.workspaceId as string;

  useEffect(() => {
    loadWorkspace?.current?.(workspaceId);
  }, [workspaceId, loadWorkspace]);

  return currentWorkspaceId === workspaceId ? currentWorkspace : null;
};

export const useLoadPage = () => {
  const router = useRouter();
  const { loadPage, currentPage } = useAppState();
  const workspace = useLoadWorkspace();

  const pageId = router.query.pageId as string;

  useEffect(() => {
    loadPage?.current?.(pageId);
  }, [workspace, pageId, loadPage]);

  return currentPage?.pageId === pageId ? currentPage : null;
};
