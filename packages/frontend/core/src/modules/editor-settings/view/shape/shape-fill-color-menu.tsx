import { useAppSettingHelper } from '@affine/core/hooks/affine/use-app-setting-helper';
import { useEffect } from 'react';

import { capitalizeFirstLetter } from '../../entities/utils';
import { ColorMenu } from '../menu/color-menu';
import type { ShapeMenuProps } from './shape-preview';

const shapeFillColors = [
  '--affine-palette-shape-yellow',
  '--affine-palette-shape-orange',
  '--affine-palette-shape-tangerine',
  '--affine-palette-shape-red',
  '--affine-palette-shape-magenta',
  '--affine-palette-shape-purple',
  '--affine-palette-shape-green',
  '--affine-palette-shape-blue',
  '--affine-palette-shape-navy',
  '--affine-palette-shape-black',
  '--affine-palette-shape-white',
  '--affine-palette-transparent',
];

const texts = shapeFillColors.map(color =>
  capitalizeFirstLetter(color.split('-').pop() as string)
);

export const ShapeFillColorMenu: React.FC<ShapeMenuProps> = ({ shape }) => {
  const { appSettings, updateSettings } = useAppSettingHelper();
  let index = shapeFillColors.findIndex(v => v === appSettings.shapeFillColor);
  index = index === -1 ? 0 : index;
  const color = appSettings.shapeFillColor ?? shapeFillColors[index];
  useEffect(() => {
    shape.fillColor = color;
  });

  return (
    <ColorMenu
      curColor={color}
      colors={shapeFillColors}
      texts={texts}
      text={texts[index]}
      onSelected={color => {
        updateSettings('shapeFillColor', color);
        shape.fillColor = color;
      }}
    />
  );
};
