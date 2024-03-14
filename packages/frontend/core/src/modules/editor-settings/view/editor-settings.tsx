import { RadioButton, RadioButtonGroup, Switch } from '@affine/component';
import {
  SettingHeader,
  SettingRow,
  SettingWrapper,
} from '@affine/component/setting-components';
import { useAFFiNEI18N } from '@affine/i18n/hooks';
import { EdgelessIcon, PageIcon } from '@blocksuite/icons';
import { type AppSetting, fontStyleOptions } from '@toeverything/infra/atom';
import { cssVar } from '@toeverything/theme';
import { useCallback } from 'react';

import { useAppSettingHelper } from '../../../hooks/affine/use-app-setting-helper';
import { ConnectorPreview } from './connector/connector-preview';
import { NotePreview } from './note/note-preview';
import { PenPreview } from './pen/pen-preview';
import { ShapePreview } from './shape/shape-preview';
import { settingWrapper } from './style.css';
import { TextPreview } from './text/text-preview';

const FontFamilySettings = () => {
  const t = useAFFiNEI18N();
  const { appSettings, updateSettings } = useAppSettingHelper();
  return (
    <RadioButtonGroup
      width={250}
      className={settingWrapper}
      value={appSettings.fontStyle}
      onValueChange={useCallback(
        (key: AppSetting['fontStyle']) => {
          updateSettings('fontStyle', key);
        },
        [updateSettings]
      )}
    >
      {fontStyleOptions.map(({ key, value }) => {
        let font = '';
        switch (key) {
          case 'Sans':
            font = t['com.affine.appearanceSettings.fontStyle.sans']();
            break;
          case 'Serif':
            font = t['com.affine.appearanceSettings.fontStyle.serif']();
            break;
          case 'Mono':
            font = t[`com.affine.appearanceSettings.fontStyle.mono`]();
            break;
          default:
            break;
        }
        return (
          <RadioButton
            key={key}
            value={key}
            data-testid="system-font-style-trigger"
            style={{
              fontFamily: value,
            }}
          >
            {font}
          </RadioButton>
        );
      })}
    </RadioButtonGroup>
  );
};

const CodeBlockDefaultLanugageMenu = () => {
  return <div></div>;
};

export const EditorSettings = () => {
  const t = useAFFiNEI18N();

  const { appSettings, updateSettings } = useAppSettingHelper();

  return (
    <>
      <SettingHeader
        title={t['com.affine.editorSetting.title']()}
        subtitle={t['com.affine.editorSetting.subtitle']()}
      />
      <SettingWrapper
        title={
          <>
            <PageIcon /> {t['com.affine.editorSetting.pageMode']()}
          </>
        }
      >
        <SettingRow
          name={t['com.affine.editorSetting.fullWidth']()}
          desc={t['com.affine.editorSetting.fullWidthDesc']()}
        >
          <Switch
            data-testid="full-width-layout-trigger"
            checked={appSettings.fullWidthLayout}
            onChange={checked => updateSettings('fullWidthLayout', checked)}
          />
        </SettingRow>
        <SettingRow
          name={t['com.affine.editorSetting.fontStyle']()}
          desc={t['com.affine.editorSetting.fontStyleDesc']()}
        >
          <FontFamilySettings />
        </SettingRow>
        <SettingRow
          name={t['com.affine.editorSetting.codeBlocks.title']()}
          style={{ color: cssVar('textSecondaryColor') }}
        />
        <SettingRow
          name={t['com.affine.editorSetting.codeBlocks.defaultLanguage']()}
          desc={t['com.affine.editorSetting.codeBlocks.defaultLanguageDesc']()}
        >
          <CodeBlockDefaultLanugageMenu />
        </SettingRow>
        <SettingRow name={t['com.affine.editorSetting.codeBlocks.wrapCode']()}>
          <Switch
            data-testid="wrap-code-trigger"
            checked={appSettings.codeBlockWrapCode}
            onChange={checked => updateSettings('codeBlockWrapCode', checked)}
          />
        </SettingRow>
      </SettingWrapper>

      <SettingWrapper
        title={
          <>
            <EdgelessIcon /> {t['com.affine.editorSetting.edgelessMode']()}
          </>
        }
      >
        <NotePreview />
      </SettingWrapper>
      <SettingWrapper>
        <ShapePreview />
      </SettingWrapper>
      <SettingWrapper>
        <TextPreview />
      </SettingWrapper>
      <SettingWrapper>
        <ConnectorPreview />
      </SettingWrapper>
      <SettingWrapper>
        <PenPreview />
      </SettingWrapper>
    </>
  );
};
