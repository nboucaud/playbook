import 'reflect-metadata';

import '@affine/component/theme/global.css';
import '@affine/component/theme/theme.css';

import { AffineContext } from '@affine/component/context';
import { GlobalLoading } from '@affine/component/global-loading';
import { WorkspaceFallback } from '@affine/core/components/workspace';
import { configureCommonModules, configureImpls } from '@affine/core/modules';
import {
  configureBrowserWorkspaceFlavours,
  configureIndexedDBWorkspaceEngineStorageProvider,
} from '@affine/core/modules/workspace-engine';
import { router } from '@affine/core/router';
import { Telemetry } from '@affine/core/telemetry';
import createEmotionCache from '@affine/core/utils/create-emotion-cache';
import { createI18n, setUpLanguage } from '@affine/i18n';
import { CacheProvider } from '@emotion/react';
import { Framework, FrameworkRoot, getCurrentStore } from '@toeverything/infra';
import { Suspense } from 'react';
import { renderToReadableStream } from 'react-dom/server';
import { RouterProvider } from 'react-router-dom';

const cache = createEmotionCache();

const future = {
  v7_startTransition: true,
} as const;

async function loadLanguage() {
  const i18n = createI18n();
  document.documentElement.lang = i18n.language;
  await setUpLanguage(i18n);
}

let languageLoadingPromise: Promise<void> | null = null;

const DEFAULT_DESCRIPTION = `There can be more than Notion and Miro. AFFiNE is a next-gen knowledge base that brings planning, sorting and creating all together.`;

const framework = new Framework();
configureCommonModules(framework);
configureImpls(framework);
configureBrowserWorkspaceFlavours(framework);
configureIndexedDBWorkspaceEngineStorageProvider(framework);
const frameworkProvider = framework.provider();

export function App() {
  if (!languageLoadingPromise) {
    languageLoadingPromise = loadLanguage().catch(console.error);
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <title>AFFiNE</title>
        <meta name="theme-color" content="#fafafa" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="icon" sizes="192x192" href="/favicon-192.png" />
        <meta name="emotion-insertion-point" content="" />
        <meta property="description" content={DEFAULT_DESCRIPTION} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://app.affine.pro/" />
        <meta
          name="twitter:title"
          content="AFFiNE: There can be more than Notion and Miro."
        />
        <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
        <meta name="twitter:site" content="@AffineOfficial" />
        <meta name="twitter:image" content="https://affine.pro/og.jpeg" />
        <meta
          property="og:title"
          content="AFFiNE: There can be more than Notion and Miro."
        />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} />
        <meta property="og:url" content="https://app.affine.pro/" />
        <meta property="og:image" content="https://affine.pro/og.jpeg" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>

      <body>
        <div id="app" data-version="<%= GIT_SHORT_SHA %>">
          <Suspense>
            <FrameworkRoot framework={frameworkProvider}>
              <CacheProvider value={cache}>
                <AffineContext store={getCurrentStore()}>
                  <Telemetry />
                  <GlobalLoading />
                  <RouterProvider
                    fallbackElement={<WorkspaceFallback key="RouterFallback" />}
                    router={router}
                    future={future}
                  />
                </AffineContext>
              </CacheProvider>
            </FrameworkRoot>
          </Suspense>
        </div>
      </body>
    </html>
  );
}

export function renderApp() {
  return renderToReadableStream(<App />);
}
