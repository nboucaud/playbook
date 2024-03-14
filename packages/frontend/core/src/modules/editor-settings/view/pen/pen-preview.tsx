import { SettingRow } from '@affine/component/setting-components';
import { useAFFiNEI18N } from '@affine/i18n/hooks';

import { previewTitle } from '../style.css';
import { PenColorMenu } from './pen-color-menu';

export const PenPreview = () => {
  const t = useAFFiNEI18N();

  return (
    <>
      <div className={previewTitle}>Pen</div>

      <SettingRow
        name={t['com.affine.editorSetting.pen.thickness']()}
      ></SettingRow>
      <SettingRow name={t['com.affine.editorSetting.pen.color']()}>
        <PenColorMenu />
      </SettingRow>
    </>
  );
};
