import { capitalizeFirstLetter } from './utils';

export const generalColors = [
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
  '--affine-palette-line-grey',
  '--affine-palette-line-white',
];

export const texts = generalColors.map(color =>
  capitalizeFirstLetter(color.split('-').pop() as string)
);
