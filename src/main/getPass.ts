import { app, BrowserWindow, screen, ipcMain, Menu, dialog } from 'electron';
import * as path from 'path';
import * as url from 'url';

let key: string | null = null;
let win: BrowserWindow | null = null;

  

function createWindow() {
  win = new BrowserWindow({
    center: true,
    show: false,
    resizable: false,
    webPreferences: {
      // Disabled Node integration
      nodeIntegration: false,
      // protect against prototype pollution
      contextIsolation: true,
      // Preload script
      preload: path.join(app.getAppPath(), 'dist/preload', 'preload.js')
    }
  });

  win.loadURL(url.format({
    pathname: path.join(app.getAppPath(), 'dist/renderer', 'index.html'),
    protocol: 'file:',
    slashes: true,
    hash: '/dup'
  }));

  win.once('ready-to-show', () => {
    if (win) {
      win.show();
    }
  });

  win.on('closed', () => {
    win = null;
  });
}

function getKey() {
  return 'test';
}

app.whenReady().then(() => {
  createWindow()
});



export { getKey }