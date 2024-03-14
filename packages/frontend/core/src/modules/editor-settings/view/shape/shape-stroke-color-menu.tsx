import { useAppSettingHelper } from '@affine/core/hooks/affine/use-app-setting-helper';
import { useEffect } from 'react';

import { capitalizeFirstLetter } from '../../entities/utils';
import { ColorMenu } from '../menu/color-menu';
import type { ShapeMenuProps } from './shape-preview';

const shapeStrokeColors = [
  '--affine-palette-line-yellow',
  '--affine-palette-line-orange',
  '--affine-palette-line-tangerine',
  '--affine-palette-line-red',
  '--affine-palette-line-magenta',
  '--affine-palette-line-purple',
  '--affine-palette-line-green',
  '--affine-palette-line-blue',
  '--affine-palette-line-navy',
  '--affine-palette-line-black',
  '--affine-palette-line-white',
  '--affine-palette-transparent',
];

const texts = shapeStrokeColors.map(color =>
  capitalizeFirstLetter(color.split('-').pop() as string)
);

export const ShapeStrokeColorMenu: React.FC<ShapeMenuProps> = ({ shape }) => {
  const { appSettings, updateSettings } = useAppSettingHelper();
  let index = shapeStrokeColors.findIndex(
    v => v === appSettings.shapeBorderColor
  );
  index = index === -1 ? 0 : index;
  const color = appSettings.shapeBorderColor ?? shapeStrokeColors[index];
  useEffect(() => {
    shape.strokeColor = color;
  });

  return (
    <ColorMenu
      curColor={color}
      colors={shapeStrokeColors}
      texts={texts}
      text={texts[index]}
      onSelected={color => {
        updateSettings('shapeBorderColor', color);
        shape.strokeColor = color;
      }}
    />
  );
};
