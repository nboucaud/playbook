import { SettingRow } from '@affine/component/setting-components';
import { useAFFiNEI18N } from '@affine/i18n/hooks';
import {
  Bound,
  type EdgelessRootService,
  type NoteBlockModel,
  type RootBlockModel,
} from '@blocksuite/blocks';
import type { EdgelessEditor } from '@blocksuite/presets';
import { useEffect, useRef, useState } from 'react';

import { usePreviewDoc } from '../../entities/use-preview-doc';
import { EdgelessPreview } from '../edgeless-preview';
import { previewTitle } from '../style.css';
import { BackgroundMenu } from './background-menu';
import { BorderStylesMenu } from './border-style-menu';
import { CornerMenu } from './corner-menu';
import { ShadowMenu } from './shadow-style-menu';

export interface NoteMenuProps {
  note: NoteBlockModel;
}

export const NotePreview = () => {
  const { doc, docCollection } = usePreviewDoc();
  const [note, setNote] = useState<NoteBlockModel | null>(null);
  const edgelessRef = useRef<EdgelessEditor>(null);
  const t = useAFFiNEI18N();

  useEffect(() => {
    if (!doc || !docCollection || !edgelessRef.current) return;

    const pageBlock = doc.getBlockByFlavour('affine:page')[0] as RootBlockModel;
    const noteId = doc.addBlock(
      'affine:note',
      {
        xywh: `[0,-100,435,100]`,
        background: '--affine-tag-yellow',
      },
      pageBlock.id
    );
    const note = doc.getBlockById(noteId) as NoteBlockModel;
    note.edgeless.style.borderRadius = 4;
    setNote(note);

    doc.addBlock(
      'affine:paragraph',
      {
        type: 'h2',
        text: new doc.Text('Write, draw, plan all at once.'),
      },
      noteId
    );
    doc.addBlock(
      'affine:paragraph',
      {
        text: new doc.Text(
          'AFFiNE is a workspace with fully merged docs, whiteboards and databases.'
        ),
      },
      noteId
    );

    setTimeout(() => {
      const ps =
        edgelessRef.current?.host?.spec?.getService<EdgelessRootService>(
          'affine:page'
        );
      if (!ps) return;
      ps.viewport.setViewportByBound(
        Bound.deserialize(note.xywh),
        [20, 20, 20, 20]
      );
    }, 64);

    return () => {
      doc.deleteBlock(note);
    };
  }, [doc, docCollection]);

  if (!doc) return null;

  return (
    <>
      <div className={previewTitle}>Note</div>
      <EdgelessPreview doc={doc} ref={edgelessRef} />
      {note && (
        <>
          <SettingRow name={t['com.affine.editorSetting.note.background']()}>
            <BackgroundMenu note={note} />
          </SettingRow>
          <SettingRow name={t['com.affine.editorSetting.note.shadowStyle']()}>
            <ShadowMenu note={note} />
          </SettingRow>
          <SettingRow name={t['com.affine.editorSetting.note.borderStyle']()}>
            <BorderStylesMenu note={note} />
          </SettingRow>
          <SettingRow
            name={t['com.affine.editorSetting.note.borderThickness']()}
          ></SettingRow>
          <SettingRow name={t['com.affine.editorSetting.note.corners']()}>
            <CornerMenu note={note} />
          </SettingRow>
        </>
      )}
    </>
  );
};
