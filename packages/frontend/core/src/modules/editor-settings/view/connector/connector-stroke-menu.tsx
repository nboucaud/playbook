import { useAppSettingHelper } from '@affine/core/hooks/affine/use-app-setting-helper';
import { useEffect } from 'react';

import { generalColors, texts } from '../../entities/consts';
import { ColorMenu } from '../menu/color-menu';
import type { ConnectorMenuProps } from './connector-preview';

export const ConnectorStrokeMenu: React.FC<ConnectorMenuProps> = ({
  connector,
}) => {
  const { appSettings, updateSettings } = useAppSettingHelper();
  let index = generalColors.findIndex(v => v === appSettings.connectorStroke);
  index = index === -1 ? 0 : index;
  const stroke = appSettings.connectorStroke ?? generalColors[index];
  useEffect(() => {
    connector.stroke = stroke;
  });

  return (
    <ColorMenu
      curColor={stroke}
      colors={generalColors}
      texts={texts}
      text={texts[index]}
      onSelected={color => {
        updateSettings('connectorStroke', color);
        connector.stroke = color;
      }}
    />
  );
};
