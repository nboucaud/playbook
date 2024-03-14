import { useAppSettingHelper } from '@affine/core/hooks/affine/use-app-setting-helper';

import { generalColors, texts } from '../../entities/consts';
import { ColorMenu } from '../menu/color-menu';

export const PenColorMenu = () => {
  const { appSettings, updateSettings } = useAppSettingHelper();
  let index = generalColors.findIndex(v => v === appSettings.penStroke);
  index = index === -1 ? 0 : index;

  return (
    <ColorMenu
      curColor={appSettings.penStroke ?? generalColors[index]}
      colors={generalColors}
      texts={texts}
      text={texts[index]}
      onSelected={color => {
        updateSettings('penStroke', color);
      }}
    />
  );
};
