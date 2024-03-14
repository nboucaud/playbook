import { SettingRow } from '@affine/component/setting-components';
import { useAFFiNEI18N } from '@affine/i18n/hooks';
import {
  type ConnectorElementModel,
  ConnectorMode,
  type EdgelessRootService,
  type SurfaceBlockModel,
} from '@blocksuite/blocks';
import type { EdgelessEditor } from '@blocksuite/presets';
import { useEffect, useRef, useState } from 'react';

import { usePreviewDoc } from '../../entities/use-preview-doc';
import { EdgelessPreview } from '../edgeless-preview';
import { previewTitle } from '../style.css';
import { ConnectorStrokeMenu } from './connector-stroke-menu';

export interface ConnectorMenuProps {
  connector: ConnectorElementModel;
}

export const ConnectorPreview = () => {
  const { doc, docCollection } = usePreviewDoc();
  const [connector, setConnector] = useState<ConnectorElementModel | null>(
    null
  );
  const edgelessRef = useRef<EdgelessEditor>(null);
  const t = useAFFiNEI18N();

  useEffect(() => {
    if (!doc || !docCollection || !edgelessRef.current) return;

    const surfaceBlock = doc.getBlockByFlavour(
      'affine:surface'
    )[0] as SurfaceBlockModel;
    const connectorId = surfaceBlock.addElement({
      type: 'connector',
      mode: ConnectorMode.Straight,
      stroke: '--affine-palette-line-yellow',
      source: {
        position: [0, 0],
      },
      target: {
        position: [200, 0],
      },
    });
    const connector = surfaceBlock.getElementById(
      connectorId
    ) as ConnectorElementModel;
    setConnector(connector);

    requestAnimationFrame(() => {
      const ps =
        edgelessRef.current?.host?.spec?.getService<EdgelessRootService>(
          'affine:page'
        );
      ps?.viewport.applyDeltaCenter(0, 2);
    });

    return () => {
      surfaceBlock.removeElement(connectorId);
    };
  }, [doc, docCollection]);

  if (!doc) return null;

  return (
    <>
      <div className={previewTitle}>Connector</div>
      <EdgelessPreview doc={doc} ref={edgelessRef} />
      {connector && (
        <>
          <SettingRow name={t['com.affine.editorSetting.connector.color']()}>
            <ConnectorStrokeMenu connector={connector} />
          </SettingRow>
          <SettingRow
            name={t['com.affine.editorSetting.connector.borderStyle']()}
          ></SettingRow>
          <SettingRow
            name={t['com.affine.editorSetting.connector.borderThickness']()}
          ></SettingRow>
          <SettingRow
            name={t['com.affine.editorSetting.connector.style']()}
          ></SettingRow>
          <SettingRow
            name={t['com.affine.editorSetting.connector.connectorShape']()}
          ></SettingRow>
        </>
      )}
    </>
  );
};
