import { app, BrowserWindow, ipcMain, nativeTheme, shell } from 'electron';
import { parse } from 'url';

import { logger } from '../../logger';
import { isMacOS } from '../../utils';
import { appContext } from './context';
import { deleteWorkspace, listWorkspaces } from './data/workspace';
import { openLoadDBFileDialog, openSaveDBFileDialog } from './dialog';
import { ensureSQLiteDB } from './ensure-db';
import { getExchangeTokenParams, oauthEndpoint } from './google-auth';

function registerWorkspaceHandlers() {
  ipcMain.handle('workspace:list', async _ => {
    logger.info('list workspaces');
    return listWorkspaces(appContext);
  });

  ipcMain.handle('workspace:delete', async (_, id) => {
    logger.info('delete workspace', id);
    return deleteWorkspace(appContext, id);
  });
}

function registerUIHandlers() {
  ipcMain.handle('ui:theme-change', async (_, theme) => {
    nativeTheme.themeSource = theme;
    logger.info('theme change', theme);
  });

  ipcMain.handle('ui:sidebar-visibility-change', async (_, visible) => {
    // todo
    // detect if os is macos
    if (isMacOS()) {
      const windows = BrowserWindow.getAllWindows();
      windows.forEach(w => {
        // hide window buttons when sidebar is not visible
        w.setWindowButtonVisibility(visible);
      });
      logger.info('sidebar visibility change', visible);
    }
  });

  ipcMain.handle('ui:workspace-change', async (_, workspaceId) => {
    logger.info('workspace change', workspaceId);
  });

  // @deprecated
  ipcMain.handle('ui:get-google-oauth-code', async () => {
    logger.info('starting google sign in ...');
    shell.openExternal(oauthEndpoint);

    return new Promise((resolve, reject) => {
      const handleOpenUrl = async (_: any, url: string) => {
        const mainWindow = BrowserWindow.getAllWindows().find(
          w => !w.isDestroyed()
        );
        const urlObj = parse(url.replace('??', '?'), true);
        if (!mainWindow || !url.startsWith('affine://auth-callback')) return;
        const code = urlObj.query['code'] as string;
        if (!code) return;

        logger.info('google sign in code received from callback', code);

        app.removeListener('open-url', handleOpenUrl);
        resolve(getExchangeTokenParams(code));
      };

      app.on('open-url', handleOpenUrl);

      setTimeout(() => {
        reject(new Error('Timed out'));
        app.removeListener('open-url', handleOpenUrl);
      }, 30000);
    });
  });

  ipcMain.handle('main:env-update', async (_, env, value) => {
    process.env[env] = value;
  });
}

function registerDBHandlers() {
  ipcMain.handle('db:get-doc', async (_, id) => {
    logger.log('main: get doc', id);
    const workspaceDB = await ensureSQLiteDB(id);
    return workspaceDB.getEncodedDocUpdates();
  });

  ipcMain.handle('db:apply-doc-update', async (_, id, update) => {
    logger.log('main: apply doc update', id);
    const workspaceDB = await ensureSQLiteDB(id);
    return workspaceDB.applyUpdate(update);
  });

  ipcMain.handle('db:add-blob', async (_, workspaceId, key, data) => {
    logger.log('main: add blob', workspaceId, key);
    const workspaceDB = await ensureSQLiteDB(workspaceId);
    return workspaceDB.addBlob(key, data);
  });

  ipcMain.handle('db:get-blob', async (_, workspaceId, key) => {
    logger.log('main: get blob', workspaceId, key);
    const workspaceDB = await ensureSQLiteDB(workspaceId);
    return workspaceDB.getBlob(key);
  });

  ipcMain.handle('db:get-persisted-blobs', async (_, workspaceId) => {
    logger.log('main: get persisted blob keys', workspaceId);
    const workspaceDB = await ensureSQLiteDB(workspaceId);
    return workspaceDB.getPersistentBlobKeys();
  });

  ipcMain.handle('db:delete-blob', async (_, workspaceId, key) => {
    logger.log('main: delete blob', workspaceId, key);
    const workspaceDB = await ensureSQLiteDB(workspaceId);
    return workspaceDB.deleteBlob(key);
  });

  ipcMain.handle('ui:open-db-folder', async (_, workspaceId) => {
    const workspaceDB = await ensureSQLiteDB(workspaceId);
    logger.log('main: open db folder', workspaceDB.path);
    shell.showItemInFolder(workspaceDB.path);
  });

  ipcMain.handle('ui:open-load-db-file-dialog', async () => {
    logger.log('main: load db file dialog');
    return openLoadDBFileDialog();
  });

  ipcMain.handle(
    'ui:open-save-db-file-dialog',
    async (_, workspaceId: string) => {
      logger.log('main: open save db file dialog', workspaceId);
      return openSaveDBFileDialog(workspaceId);
    }
  );
}

export const registerHandlers = () => {
  registerWorkspaceHandlers();
  registerUIHandlers();
  registerDBHandlers();
};
