import { useTranslation } from '@affine/i18n';
import { ShareIcon } from '@blocksuite/icons';
import { assertExists } from '@blocksuite/store';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

import PageList from '../../../components/blocksuite/block-suite-page-list/page-list';
import { PageLoading } from '../../../components/pure/loading';
import { WorkspaceTitle } from '../../../components/pure/workspace-title';
import { useCurrentWorkspace } from '../../../hooks/current/use-current-workspace';
import { useRouterHelper } from '../../../hooks/use-router-helper';
import { useSyncRouterWithCurrentWorkspace } from '../../../hooks/use-sync-router-with-current-workspace';
import { WorkspaceLayout } from '../../../layouts';
import type { NextPageWithLayout } from '../../../shared';

const SharedPages: NextPageWithLayout = () => {
  const router = useRouter();
  const { jumpToPage } = useRouterHelper(router);
  const [currentWorkspace] = useCurrentWorkspace();
  const { t } = useTranslation();
  useSyncRouterWithCurrentWorkspace(router);
  const onClickPage = useCallback(
    (pageId: string, newTab?: boolean) => {
      assertExists(currentWorkspace);
      if (newTab) {
        window.open(`/workspace/${currentWorkspace?.id}/${pageId}`, '_blank');
      } else {
        jumpToPage(currentWorkspace.id, pageId);
      }
    },
    [currentWorkspace, jumpToPage]
  );
  if (currentWorkspace === null) {
    return <PageLoading />;
  }
  const blockSuiteWorkspace = currentWorkspace.blockSuiteWorkspace;
  assertExists(blockSuiteWorkspace);
  return (
    <>
      <Head>
        <title>{t('Shared Pages')} - AFFiNE</title>
      </Head>
      <WorkspaceTitle
        workspace={currentWorkspace}
        currentPage={null}
        isPreview={false}
        isPublic={false}
        icon={<ShareIcon />}
      >
        {t('Shared Pages')}
      </WorkspaceTitle>
      <PageList
        blockSuiteWorkspace={blockSuiteWorkspace}
        onClickPage={onClickPage}
        listType="shared"
      />
    </>
  );
};

export default SharedPages;

SharedPages.getLayout = page => {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};
