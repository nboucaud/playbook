import { Menu, MenuItem, MenuTrigger } from '@affine/component';
import { useAppSettingHelper } from '@affine/core/hooks/affine/use-app-setting-helper';
import { useEffect } from 'react';

import { optionText } from '../style.css';
import type { NoteMenuProps } from './note-preview';

const noteShadows = [
  '',
  '--affine-note-shadow-box',
  '--affine-note-shadow-sticker',
  '--affine-note-shadow-paper',
  '--affine-note-shadow-float',
  `--affine-note-shadow-film`,
] as const;

const texts = [
  'None',
  'Box Shadow',
  'Sticker Shadow',
  'Paper Shadow',
  'Float Shadow',
  'Film Shadow',
] as const;

export const ShadowMenu: React.FC<NoteMenuProps> = ({ note }) => {
  const { appSettings, updateSettings } = useAppSettingHelper();
  const index = noteShadows.findIndex(v => v === appSettings.noteShadow);

  useEffect(() => {
    note.edgeless.style.shadowType = appSettings.noteShadow;
  });

  return (
    <Menu
      items={noteShadows.map((shadow, index) => {
        return (
          <MenuItem
            key={shadow}
            selected={appSettings.noteShadow === shadow}
            onSelect={() => {
              updateSettings('noteShadow', shadow);
              note.edgeless.style.shadowType = shadow;
            }}
          >
            <div className={optionText}>{texts[index]}</div>
          </MenuItem>
        );
      })}
    >
      <MenuTrigger>
        <div className={optionText}>{texts[index]}</div>
      </MenuTrigger>
    </Menu>
  );
};
