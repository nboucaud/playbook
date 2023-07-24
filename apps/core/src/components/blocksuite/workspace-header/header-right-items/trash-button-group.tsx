import { Button, Confirm } from '@affine/component';
import { WorkspaceSubPath } from '@affine/env/workspace';
import { useAFFiNEI18N } from '@affine/i18n/hooks';
import { assertExists } from '@blocksuite/global/utils';
import { useBlockSuitePageMeta } from '@toeverything/hooks/use-block-suite-page-meta';
import { currentPageIdAtom } from '@toeverything/plugin-infra/manager';
import { useAtomValue } from 'jotai';
import { useCallback, useState } from 'react';

import { useBlockSuiteMetaHelper } from '../../../../hooks/affine/use-block-suite-meta-helper';
import { useCurrentWorkspace } from '../../../../hooks/current/use-current-workspace';
import { useNavigateHelper } from '../../../../hooks/use-navigate-helper';

export const TrashButtonGroup = () => {
  // fixme(himself65): remove these hooks ASAP
  const [workspace] = useCurrentWorkspace();
  const pageId = useAtomValue(currentPageIdAtom);
  assertExists(workspace);
  assertExists(pageId);
  const blockSuiteWorkspace = workspace.blockSuiteWorkspace;
  const pageMeta = useBlockSuitePageMeta(blockSuiteWorkspace).find(
    meta => meta.id === pageId
  );
  assertExists(pageMeta);
  const t = useAFFiNEI18N();
  const { jumpToSubPath } = useNavigateHelper();
  const { restoreFromTrash } = useBlockSuiteMetaHelper(blockSuiteWorkspace);

  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'absolute', bottom: '100px', left: '50vw' }}>
      <Button
        shape="round"
        style={{ marginRight: '24px' }}
        onClick={() => {
          restoreFromTrash(pageId);
        }}
      >
        {t['Restore it']()}
      </Button>
      <Button
        shape="round"
        type="error"
        onClick={() => {
          setOpen(true);
        }}
      >
        {t['Delete permanently']()}
      </Button>
      <Confirm
        title={t['TrashButtonGroupTitle']()}
        content={t['TrashButtonGroupDescription']()}
        confirmText={t['Delete']()}
        confirmType="error"
        open={open}
        onConfirm={useCallback(() => {
          jumpToSubPath(workspace.id, WorkspaceSubPath.ALL);
          blockSuiteWorkspace.removePage(pageId);
        }, [blockSuiteWorkspace, jumpToSubPath, pageId, workspace.id])}
        onCancel={() => {
          setOpen(false);
        }}
        onClose={() => {
          setOpen(false);
        }}
      />
    </div>
  );
};

export default TrashButtonGroup;
