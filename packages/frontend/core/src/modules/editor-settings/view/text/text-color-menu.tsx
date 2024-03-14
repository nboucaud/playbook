import { useAppSettingHelper } from '@affine/core/hooks/affine/use-app-setting-helper';
import { useEffect } from 'react';

import { generalColors, texts } from '../../entities/consts';
import { ColorMenu } from '../menu/color-menu';
import type { TextMenuProps } from './text-preview';

export const TextColorMenu: React.FC<TextMenuProps> = ({ text }) => {
  const { appSettings, updateSettings } = useAppSettingHelper();
  let index = generalColors.findIndex(v => v === appSettings.textColor);
  index = index === -1 ? 0 : index;
  const color = appSettings.textColor ?? generalColors[index];
  useEffect(() => {
    text.color = color;
  });

  return (
    <ColorMenu
      curColor={color}
      colors={generalColors}
      texts={texts}
      text={texts[index]}
      onSelected={color => {
        updateSettings('textColor', color);
        text.color = color;
      }}
    />
  );
};
