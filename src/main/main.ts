import { app, BrowserWindow, screen, ipcMain, Menu } from 'electron';
import * as path from 'path';
import { DtoSystemInfo } from '../ipc-dtos/dtosysteminfo';
import * as os from 'os';
import { openFile, saveFile } from './menuEvent';

let win: BrowserWindow | null = null;

//app.on('ready', createWindow);

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

function createWindow() {
  const size = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width/2,
    height: size.height/2,
    resizable: true,
    webPreferences: {
      // Disabled Node integration
      nodeIntegration: false,
      // protect against prototype pollution
      contextIsolation: true,
      // Preload script
      preload: path.join(app.getAppPath(), 'dist/preload', 'preload.js')
    }
  });

  // https://stackoverflow.com/a/58548866/600559
  //Menu.setApplicationMenu(null);
  const isMac = process.platform === 'darwin'

  const template: Object[] = [
    // { role: 'appMenu' }
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }]
      : []),
    // { role: 'fileMenu' }
    {
      label: '文件',
      submenu: [
        { label: '打开文件', accelerator: isMac ? 'Command+O': 'Ctrl+O', click: openFile },
        { label: '导入csv', accelerator: isMac ? 'Command+I': 'Ctrl+I' },
        { label: '保存', accelerator: isMac ? 'Command+S': 'Ctrl+S', click: () =>{if(win) win.webContents.send('get-data', 1)} },
        { label: '另存为', accelerator: isMac ? 'Command+Alt+S': 'Ctrl+Alt+S' },
        { type: 'separator' },
        isMac ? { label:'关闭', role: 'close' } : { label: '退出', role: 'quit' }
      ]
    },
    {
      label: '帮助',
      role: 'help',
      submenu: [
        { label: '关于',  role: 'about'}
      ]
    }

  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  win.loadFile(path.join(app.getAppPath(), 'dist/renderer', 'index.html'));

  win.on('closed', () => {
    win = null;
  });
}

app.whenReady().then(() => {
  ipcMain.on('save-data', (_event, value) => {
    saveFile(value) // will print value to Node console
  })
  //ipcMain.handle('dialog:openFile', )
  createWindow()
});

ipcMain.on('dev-tools', () => {
  if (win) {
    win.webContents.toggleDevTools();
  }
});

ipcMain.on('request-systeminfo', () => {
  const systemInfo = new DtoSystemInfo();
  systemInfo.Arch = os.arch();
  systemInfo.Hostname = os.hostname();
  systemInfo.Platform = os.platform();
  systemInfo.Release = os.release();
  const serializedString = systemInfo.serialize();
  if (win) {
    win.webContents.send('systeminfo', serializedString);
  }
});


