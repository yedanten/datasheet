import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as url from 'url';

let childwin: BrowserWindow | null = null;

function createWindow(top: BrowserWindow, value: any) {
	let childwin = new BrowserWindow({ parent: top });
	childwin.loadURL(url.format({
		pathname: path.join(app.getAppPath(), 'dist/renderer', 'index.html'),
		protocol: 'file:',
		slashes: true,
		hash: '/2'
	}));
	childwin.webContents.toggleDevTools();
	childwin.once('ready-to-show', () => {
		if (childwin) {
			childwin.show();
		}
	});
}




export { createWindow }