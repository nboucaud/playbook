import { useAppSettingHelper } from '@affine/core/hooks/affine/use-app-setting-helper';
import { useEffect } from 'react';

import { ColorMenu } from '../menu/color-menu';
import type { NoteMenuProps } from './note-preview';

const noteBackgrounds = [
  '--affine-background-secondary-color',
  '--affine-tag-yellow',
  '--affine-tag-red',
  '--affine-tag-green',
  '--affine-tag-blue',
  '--affine-tag-purple',
];

const texts = ['Gray', 'Yellow', 'Red', 'Green', 'Blue', 'Purple'];

export const BackgroundMenu: React.FC<NoteMenuProps> = ({ note }) => {
  const { appSettings, updateSettings } = useAppSettingHelper();
  let index = noteBackgrounds.findIndex(v => v === appSettings.noteBackground);
  index = index === -1 ? 1 : index;

  useEffect(() => {
    note.background = appSettings.noteBackground;
  });

  return (
    <ColorMenu
      curColor={appSettings.noteBackground ?? noteBackgrounds[index]}
      colors={noteBackgrounds}
      texts={texts}
      text={texts[index]}
      onSelected={color => {
        updateSettings('noteBackground', color);
        note.background = color;
      }}
    />
  );
};
