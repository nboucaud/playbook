import { Menu, MenuItem, MenuTrigger } from '@affine/component';
import { useAppSettingHelper } from '@affine/core/hooks/affine/use-app-setting-helper';
import { useEffect } from 'react';

import { optionText } from '../style.css';
import type { NoteMenuProps } from './note-preview';

const noteCorners = [0, 8, 16, 24, 32] as const;

const texts = ['None', 'Small', 'Medium', 'Large', 'Huge'] as const;

export const CornerMenu: React.FC<NoteMenuProps> = ({ note }) => {
  const { appSettings, updateSettings } = useAppSettingHelper();
  let index = noteCorners.findIndex(v => v === appSettings.noteBorderRadius);
  index = index === -1 ? 1 : index;
  useEffect(() => {
    note.edgeless.style.borderRadius = appSettings.noteBorderRadius;
  });

  return (
    <Menu
      items={noteCorners.map((corner, index) => {
        return (
          <MenuItem
            key={corner}
            selected={appSettings.noteBorderRadius === corner}
            onSelect={() => {
              updateSettings('noteBorderRadius', corner);
              note.edgeless.style.borderRadius = corner;
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
