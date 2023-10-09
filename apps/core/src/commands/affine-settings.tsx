import { Trans } from '@affine/i18n';
import type { useAFFiNEI18N } from '@affine/i18n/hooks';
import { SettingsIcon } from '@blocksuite/icons';
import {
  PreconditionStrategy,
  registerAffineCommand,
} from '@toeverything/infra/command';
import type { createStore } from 'jotai';
import type { useTheme } from 'next-themes';

import { openQuickSearchModalAtom } from '../atoms';
import { appSettingAtom } from '../atoms/settings';
import type { useLanguageHelper } from '../hooks/affine/use-language-helper';

export function registerAffineSettingsCommands({
  t,
  store,
  theme,
  languageHelper,
}: {
  t: ReturnType<typeof useAFFiNEI18N>;
  store: ReturnType<typeof createStore>;
  theme: ReturnType<typeof useTheme>;
  languageHelper: ReturnType<typeof useLanguageHelper>;
}) {
  const unsubs: Array<() => void> = [];
  const { onSelect, languagesList, currentLanguage } = languageHelper;
  const { clientBorder, fullWidthLayout } = store.get(appSettingAtom);
  unsubs.push(
    registerAffineCommand({
      id: 'affine:show-quick-search',
      preconditionStrategy: PreconditionStrategy.Never,
      category: 'affine:general',
      keyBinding: {
        binding: '$mod+K',
      },
      icon: <SettingsIcon />,
      run() {
        store.set(openQuickSearchModalAtom, true);
      },
    })
  );

  // color schemes
  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-color-scheme-to-auto',
      label: (
        <Trans
          i18nKey="com.affine.cmdk.affine.color-scheme.to"
          values={{ colour: 'Auto' }}
        >
          Change Colour Scheme to <strong>colour</strong>
        </Trans>
      ),
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => theme.theme !== 'system',
      run() {
        theme.setTheme('system');
      },
    })
  );
  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-color-scheme-to-dark',
      label: (
        <Trans
          i18nKey="com.affine.cmdk.affine.color-scheme.to"
          values={{ colour: 'Dark' }}
        >
          Change Colour Scheme to <strong>colour</strong>
        </Trans>
      ),
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => theme.theme !== 'dark',
      run() {
        theme.setTheme('dark');
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-color-scheme-to-light',
      label: (
        <Trans
          i18nKey="com.affine.cmdk.affine.color-scheme.to"
          values={{ colour: 'Light' }}
        >
          Change Colour Scheme to <strong>colour</strong>
        </Trans>
      ),
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => theme.theme !== 'light',
      run() {
        theme.setTheme('light');
      },
    })
  );

  //Font styles
  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-font-style-to-sans',
      label: (
        <Trans
          i18nKey="com.affine.cmdk.affine.font-style.to"
          values={{
            fontFamily: t['com.affine.appearanceSettings.fontStyle.sans'](),
          }}
        >
          Change Font Style to <strong>fontFamily</strong>
        </Trans>
      ),
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () =>
        store.get(appSettingAtom).fontStyle !== 'Sans',
      run() {
        store.set(appSettingAtom, prev => ({
          ...prev,
          fontStyle: 'Sans',
        }));
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-font-style-to-serif',
      label: (
        <Trans
          i18nKey="com.affine.cmdk.affine.font-style.to"
          values={{
            fontFamily: t['com.affine.appearanceSettings.fontStyle.serif'](),
          }}
        >
          Change Font Style to
          <strong style={{ fontFamily: 'var(--affine-font-serif-family)' }}>
            fontFamily
          </strong>
        </Trans>
      ),
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () =>
        store.get(appSettingAtom).fontStyle !== 'Serif',
      run() {
        store.set(appSettingAtom, prev => ({
          ...prev,
          fontStyle: 'Serif',
        }));
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-font-style-to-mono',
      label: (
        <Trans
          i18nKey="com.affine.cmdk.affine.font-style.to"
          values={{
            fontFamily: t['com.affine.appearanceSettings.fontStyle.mono'](),
          }}
        >
          Change Font Style to
          <strong style={{ fontFamily: 'var(--affine-font-mono-family)' }}>
            fontFamily
          </strong>
        </Trans>
      ),
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () =>
        store.get(appSettingAtom).fontStyle !== 'Mono',
      run() {
        store.set(appSettingAtom, prev => ({
          ...prev,
          fontStyle: 'Mono',
        }));
      },
    })
  );

  //Display Language
  languagesList.forEach(language => {
    unsubs.push(
      registerAffineCommand({
        id: `affine:change-display-language-to-${language.name}`,
        label: (
          <Trans
            i18nKey="com.affine.cmdk.affine.display-language.to"
            values={{
              language: language.originalName,
            }}
          >
            Change Display Language to
            <strong>language</strong>
          </Trans>
        ),
        category: 'affine:settings',
        icon: <SettingsIcon />,
        preconditionStrategy: () => currentLanguage?.tag !== language.tag,
        run() {
          onSelect(language.tag);
        },
      })
    );
  });

  //Layout Style
  unsubs.push(
    registerAffineCommand({
      id: `affine:change-client-border-style-to-${clientBorder ? 'off' : 'on'}`,
      label: (
        <Trans
          i18nKey="com.affine.cmdk.affine.client-border-style.to"
          values={{
            state: clientBorder ? 'OFF' : 'ON',
          }}
        >
          Change Client Border Style to
          <strong>state</strong>
        </Trans>
      ),
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => environment.isDesktop,
      run() {
        store.set(appSettingAtom, prev => ({
          ...prev,
          clientBorder: !prev.clientBorder,
        }));
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: `affine:change-full-width-layout-to-${
        fullWidthLayout ? 'off' : 'on'
      }`,
      label: (
        <Trans
          i18nKey="com.affine.cmdk.affine.full-width-layout.to"
          values={{
            state: fullWidthLayout ? 'OFF' : 'ON',
          }}
        >
          Change Full Width Layout to
          <strong>state</strong>
        </Trans>
      ),
      category: 'affine:settings',
      icon: <SettingsIcon />,
      run() {
        store.set(appSettingAtom, prev => ({
          ...prev,
          fullWidthLayout: !prev.fullWidthLayout,
        }));
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
