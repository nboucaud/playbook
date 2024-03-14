import { SettingRow } from '@affine/component/setting-components';
import { useAFFiNEI18N } from '@affine/i18n/hooks';
import type {
  EdgelessRootService,
  SurfaceBlockModel,
  TextElementModel,
} from '@blocksuite/blocks';
import type { EdgelessEditor } from '@blocksuite/presets';
import { useEffect, useRef, useState } from 'react';

import { usePreviewDoc } from '../../entities/use-preview-doc';
import { EdgelessPreview } from '../edgeless-preview';
import { previewTitle } from '../style.css';
import { TextColorMenu } from './text-color-menu';

export interface TextMenuProps {
  text: TextElementModel;
}

export const TextPreview = () => {
  const { doc, docCollection } = usePreviewDoc();
  const [text, setText] = useState<TextElementModel | null>(null);
  const edgelessRef = useRef<EdgelessEditor>(null);
  const t = useAFFiNEI18N();

  useEffect(() => {
    if (!doc || !docCollection || !edgelessRef.current) return;

    const surfaceBlock = doc.getBlockByFlavour(
      'affine:surface'
    )[0] as SurfaceBlockModel;
    const textId = surfaceBlock.addElement({
      type: 'text',
      text: 'To shape, Not to adapt.',
      xywh: `[0,0,450,50]`,
      color: '--affine-palette-line-tangerine',
      fontFamily: 'blocksuite:surface:Inter',
      fontSize: 40,
      fontWeight: 400,
      textAlign: 'center',
    });
    const text = surfaceBlock.getElementById(textId) as TextElementModel;
    setText(text);

    requestAnimationFrame(() => {
      const ps =
        edgelessRef.current?.host?.spec?.getService<EdgelessRootService>(
          'affine:page'
        );
      ps?.viewport.applyDeltaCenter(0, 2);
    });

    return () => {
      surfaceBlock.removeElement(textId);
    };
  }, [doc, docCollection]);

  if (!doc) return null;

  return (
    <>
      <div className={previewTitle}>Text</div>
      <EdgelessPreview doc={doc} ref={edgelessRef} />
      {text && (
        <>
          <SettingRow name={t['com.affine.editorSetting.text.color']()}>
            <TextColorMenu text={text} />
          </SettingRow>
          <SettingRow
            name={t['com.affine.editorSetting.text.font']()}
          ></SettingRow>
          <SettingRow
            name={t['com.affine.editorSetting.text.fontSize']()}
          ></SettingRow>
          <SettingRow
            name={t['com.affine.editorSetting.text.fontWeight']()}
          ></SettingRow>
          <SettingRow
            name={t['com.affine.editorSetting.text.alignment']()}
          ></SettingRow>
        </>
      )}
    </>
  );
};
