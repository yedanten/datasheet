import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as url from 'url';

let childwin: BrowserWindow | null = null;


function createWindow(top: BrowserWindow, value: any) {
	if (childwin === null) {
		createChildWindow(top, value);
	}
}

function createChildWindow(top: BrowserWindow, value: any) {
	childwin = new BrowserWindow({
		parent: top,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(app.getAppPath(), 'dist/preload', 'preload.js')
		}
	});

	childwin.loadURL(url.format({
		pathname: path.join(app.getAppPath(), 'dist/renderer', 'index.html'),
		protocol: 'file:',
		slashes: true,
		hash: '/dup'
	}));

	childwin.webContents.toggleDevTools();

	childwin.once('ready-to-show', () => {
		if (childwin) {
      childwin.webContents.send('set-dupObj', value);
			childwin.show();
		}
	});

  childwin.on('closed', () => {
    childwin = null;
  });
}



export { createWindow, childwin }