import { UserFeatureService } from '@affine/core/modules/cloud/services/user-feature';
import { useI18n } from '@affine/i18n';
import { AppearanceIcon, KeyboardIcon, PenIcon } from '@blocksuite/icons/rc';
import {
  FeatureFlagService,
  useLiveData,
  useServices,
} from '@toeverything/infra';
import type { ReactElement, SVGProps } from 'react';
import { useEffect } from 'react';

import type { GeneralSettingKey } from '../types';
import { AppearanceSettings } from './appearance';
import { EditorSettings } from './editor';
import { Shortcuts } from './shortcuts';

interface GeneralSettingListItem {
  key: GeneralSettingKey;
  title: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
  testId: string;
}

export type GeneralSettingList = GeneralSettingListItem[];

export const useGeneralSettingList = (): GeneralSettingList => {
  const t = useI18n();
  const { userFeatureService, featureFlagService } = useServices({
    UserFeatureService,
    FeatureFlagService,
  });

  const enableEditorSettings = useLiveData(
    featureFlagService.flags.enable_editor_settings.$
  );

  useEffect(() => {
    userFeatureService.userFeature.revalidate();
  }, [userFeatureService]);

  const settings: GeneralSettingListItem[] = [
    {
      key: 'appearance',
      title: t['com.affine.settings.appearance'](),
      icon: AppearanceIcon,
      testId: 'appearance-panel-trigger',
    },
    {
      key: 'shortcuts',
      title: t['com.affine.keyboardShortcuts.title'](),
      icon: KeyboardIcon,
      testId: 'shortcuts-panel-trigger',
    },
  ];

  if (enableEditorSettings) {
    // add editor settings to second position
    settings.splice(1, 0, {
      key: 'editor',
      title: t['com.affine.settings.editorSettings'](),
      icon: PenIcon,
      testId: 'editor-panel-trigger',
    });
  }

  return settings;
};

interface GeneralSettingProps {
  generalKey: GeneralSettingKey;
}

export const GeneralSetting = ({ generalKey }: GeneralSettingProps) => {
  switch (generalKey) {
    case 'shortcuts':
      return <Shortcuts />;
    case 'editor':
      return <EditorSettings />;
    case 'appearance':
      return <AppearanceSettings />;
    default:
      return null;
  }
};
