import { app, BrowserWindow, screen, ipcMain, Menu, dialog } from 'electron';
import * as path from 'path';
import { DtoSystemInfo } from '../ipc-dtos/dtosysteminfo';
import * as os from 'os';
import * as fsPromises from 'fs/promises';
import * as url from 'url';
import { importCSV, saveFile } from './menuEvent';
import { decryptData } from './aes'
import * as Duplicate from './duplicate';

let win: BrowserWindow | null = null;
let winCanClosedFlag = true;
const fileDir: string = process.platform === 'darwin' ? path.join(<string>process.env.HOME,'.safeSheet'):path.join(<string>process.env.LOCALAPPDATA, 'safeSheet');
let fileData: string = '';
let key: string | null = null;


app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

function fileNotFind(reason: any) {
  throw new Error("file not found", { cause: reason });
}

async function initEnv(inputPass: string): Promise<boolean> {
  const flag = fsPromises.mkdir(fileDir, { recursive:true })
    .then((value) => {
      return fsPromises.readFile(path.join(fileDir,'data.sdb'), 'utf8')
    }).then((value) => {
      return new Promise((resolve, reject) => {
        resolve(decryptData(inputPass, Buffer.from(value).toString()));
      });
    }, fileNotFind).then((value) => {
      fileData = <string>value;
      key = inputPass;
      return true;
    }).catch((e) => {
      if (e.cause) {
        key = inputPass;
        return true;
      } else {
        return false;
      }
    });
  return flag;

}

function createWindow() {
  const size = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width/2,
    height: size.height/3*2,
    resizable: true,
    show: false,
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
        { label: '导入csv', accelerator: isMac ? 'Command+I': 'Ctrl+I', click: importCSV },
        { label: '保存', accelerator: isMac ? 'Command+S': 'Ctrl+S', click: () =>{if(win) win.webContents.send('get-data')} },
        { type: 'separator' },
        isMac ? { label:'关闭', role: 'close' } : { label: '退出', role: 'quit' }
      ]
    }

  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  
  win.loadURL(url.format({
    pathname: path.join(app.getAppPath(), 'dist/renderer', 'index.html'),
    protocol: 'file:',
    slashes: true,
    hash: '/home'
  }));

  win.once('ready-to-show', () => {
    if (win) {
      win.webContents.toggleDevTools();
      win.show();
    }
  });

  win.on('close', async (event) => {
    if (!winCanClosedFlag) {
      event.preventDefault();
      let choice = await dialog.showMessageBox(win!, {
        title: "do you want to close",
        message: "您的修改暂未保存,是否放弃修改并关闭程序",
        buttons: ["否", "是"]
      });
      if (choice.response == 1) {
        winCanClosedFlag = true;
        win!.close();
        return;
      }
    }
  });

  win.on('closed', () => {
    win = null;
  });
}

app.whenReady().then(async () => {
  //initEnv();
  if (win === null) {
    createWindow();
  }
});


ipcMain.handle('init-data', () => {return fileData});
ipcMain.handle('get-pass', () => {return key});
ipcMain.handle('verify-pass', (_event, data) => {
  return initEnv(data);
});

ipcMain.on('save-data', (_event, value) => {
  saveFile(value, key!);
  winCanClosedFlag = true;
})

ipcMain.on('not-close', (_event) => {
  winCanClosedFlag = false;
});

ipcMain.on('dup-window', (_event, value) => {
  if (win) {
    Duplicate.createWindow(win, value);
  }
});