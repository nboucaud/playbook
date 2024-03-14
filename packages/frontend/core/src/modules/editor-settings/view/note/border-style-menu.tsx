import { Menu, MenuItem, MenuTrigger } from '@affine/component';
import { useAppSettingHelper } from '@affine/core/hooks/affine/use-app-setting-helper';
import type { StrokeStyle } from '@blocksuite/blocks';
import { useEffect } from 'react';

import { capitalizeFirstLetter } from '../../entities/utils';
import { optionText } from '../style.css';
import type { NoteMenuProps } from './note-preview';

const borderStyles = ['solid', 'dash', 'none'] as const;

export const BorderStylesMenu: React.FC<NoteMenuProps> = ({ note }) => {
  const { appSettings, updateSettings } = useAppSettingHelper();
  let index = borderStyles.findIndex(v => v === appSettings.noteBorderStyle);
  index = index === -1 ? 0 : index;

  useEffect(() => {
    note.edgeless.style.borderStyle =
      appSettings.noteBorderStyle as StrokeStyle;
  });

  return (
    <Menu
      items={borderStyles.map((borderStyle, index) => {
        return (
          <MenuItem
            key={borderStyle}
            selected={appSettings.noteBorderStyle === borderStyle}
            onSelect={() => {
              updateSettings('noteBorderStyle', borderStyle);
              note.edgeless.style.borderStyle = borderStyle as StrokeStyle;
            }}
          >
            <div className={optionText}>
              {capitalizeFirstLetter(borderStyles[index])}
            </div>
          </MenuItem>
        );
      })}
    >
      <MenuTrigger>
        <div className={optionText}>
          {capitalizeFirstLetter(borderStyles[index])}
        </div>
      </MenuTrigger>
    </Menu>
  );
};
