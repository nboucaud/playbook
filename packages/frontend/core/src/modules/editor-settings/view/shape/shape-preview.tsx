import { SettingRow } from '@affine/component/setting-components';
import { useAFFiNEI18N } from '@affine/i18n/hooks';
import type {
  EdgelessRootService,
  ShapeElementModel,
  SurfaceBlockModel,
} from '@blocksuite/blocks';
import type { EdgelessEditor } from '@blocksuite/presets';
import { useEffect, useRef, useState } from 'react';

import { usePreviewDoc } from '../../entities/use-preview-doc';
import { EdgelessPreview } from '../edgeless-preview';
import { previewTitle } from '../style.css';
import { ShapeFillColorMenu } from './shape-fill-color-menu';
import { ShapeStrokeColorMenu } from './shape-stroke-color-menu';

export interface ShapeMenuProps {
  shape: ShapeElementModel;
}

export const ShapePreview = () => {
  const { doc, docCollection } = usePreviewDoc();
  const [shape, setShape] = useState<ShapeElementModel | null>(null);
  const edgelessRef = useRef<EdgelessEditor>(null);
  const t = useAFFiNEI18N();

  useEffect(() => {
    if (!doc || !docCollection || !edgelessRef.current) return;

    const surfaceBlock = doc.getBlockByFlavour(
      'affine:surface'
    )[0] as SurfaceBlockModel;
    const shapeId = surfaceBlock.addElement({ type: 'shape', radius: 0.1 });
    const shape = surfaceBlock.getElementById(shapeId) as ShapeElementModel;
    setShape(shape);

    requestAnimationFrame(() => {
      const ps =
        edgelessRef.current?.host?.spec?.getService<EdgelessRootService>(
          'affine:page'
        );
      ps?.viewport.applyDeltaCenter(0, 2);
    });

    return () => {
      surfaceBlock.removeElement(shapeId);
    };
  }, [doc, docCollection]);

  if (!doc) return null;

  return (
    <>
      <div className={previewTitle}>Shape</div>
      <EdgelessPreview doc={doc} ref={edgelessRef} />
      {shape && (
        <>
          <SettingRow
            name={t['com.affine.editorSetting.shape.type']()}
          ></SettingRow>
          <SettingRow
            name={t['com.affine.editorSetting.shape.style']()}
          ></SettingRow>
          <SettingRow name={t['com.affine.editorSetting.shape.fillColor']()}>
            <ShapeFillColorMenu shape={shape} />
          </SettingRow>
          <SettingRow name={t['com.affine.editorSetting.shape.borderColor']()}>
            <ShapeStrokeColorMenu shape={shape} />
          </SettingRow>
          <SettingRow
            name={t['com.affine.editorSetting.shape.borderStyle']()}
          ></SettingRow>
          <SettingRow
            name={t['com.affine.editorSetting.shape.borderThickness']()}
          ></SettingRow>
        </>
      )}
    </>
  );
};
