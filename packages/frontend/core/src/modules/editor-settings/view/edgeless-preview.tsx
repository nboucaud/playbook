import { BlocksuiteEdgelessEditor } from '@affine/core/components/blocksuite/block-suite-editor/lit-adaper';
import type { EdgelessEditor } from '@blocksuite/presets';
import type { Doc } from '@blocksuite/store';
import { forwardRef } from 'react';

import {
  editorPreviewContainer,
  editorPreviewMask,
  editorPreviewTip,
} from './style.css';

interface EdgelessPreviewProps {
  doc: Doc;
}

export const EdgelessPreview = forwardRef<EdgelessEditor, EdgelessPreviewProps>(
  function EdgelessPreview({ doc }, ref) {
    return (
      <div className={editorPreviewContainer}>
        <BlocksuiteEdgelessEditor ref={ref} page={doc} />
        <div className={editorPreviewMask} />
        <div className={editorPreviewTip}>Preview</div>
      </div>
    );
  }
);
