import { Menu, MenuItem, MenuTrigger } from '@affine/component';
import { cssVar } from '@toeverything/theme';

import { optionText } from '../style.css';

type cssValue = Parameters<typeof cssVar>[0];

const Color: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          margin: 8,
          background: cssVar(color as cssValue, color),
        }}
      ></div>
      <div className={optionText}>{text}</div>
    </div>
  );
};
interface ColorMenuProps {
  colors: string[];
  curColor: string;
  texts: string[];
  text: string;
  onSelected: (color: string) => void;
}

export const ColorMenu: React.FC<ColorMenuProps> = ({
  curColor,
  colors,
  texts,
  text,
  onSelected,
}) => {
  return (
    <Menu
      items={colors.map((color, index) => {
        return (
          <MenuItem
            key={color}
            selected={curColor === color}
            onSelect={() => {
              onSelected(color);
            }}
          >
            <Color text={texts[index]} color={color} />
          </MenuItem>
        );
      })}
    >
      <MenuTrigger>
        <Color text={text} color={curColor} />
      </MenuTrigger>
    </Menu>
  );
};
