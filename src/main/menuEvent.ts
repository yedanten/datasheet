import { app, dialog, BrowserWindow,MenuItem } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as csv from 'csvtojson';
import xlsx from 'node-xlsx';
import { encryptData } from './aes';

// 从XLS里导入数据
async function importXLS(_:MenuItem, win: BrowserWindow) {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: '全部文件', extensions: ['xls', 'xlsx']}],
    properties: ['openFile', 'createDirectory', 'dontAddToRecent']
  })
  if (!canceled) {
    const workSheetsFromFile = xlsx.parse(filePaths[0]);
    win.webContents.send('dialog:importXLS', workSheetsFromFile[0].data);
  }
}

// 保存表格数据到文件，数据经过加密
async function saveFile(data: Object, key: string) {
  const fileDir: string = process.platform === 'darwin' ? path.join(<string>process.env.HOME,'.safeSheet'):path.join(<string>process.env.LOCALAPPDATA, 'safeSheet');
  const plainData = JSON.stringify(data);
  const fileData = encryptData(key, plainData); // key, data
  fs.writeFileSync(path.join(fileDir, 'data.sdb'), fileData);
}

// 保存每个单元格元数据到文件，数据经过加密
async function saveMeta(data: Array<any>, key: string) {
  const fileDir: string = process.platform === 'darwin' ? path.join(<string>process.env.HOME,'.safeSheet'):path.join(<string>process.env.LOCALAPPDATA, 'safeSheet');
  const plainData = JSON.stringify(data);
  const fileData = encryptData(key, plainData); // key, data
  fs.writeFileSync(path.join(fileDir, 'meta.sdb'), fileData);
}

async function saveWinMeat(data: Object, key: string) {
  const fileDir: string = process.platform === 'darwin' ? path.join(<string>process.env.HOME,'.safeSheet'):path.join(<string>process.env.LOCALAPPDATA, 'safeSheet');
  const winMeata = JSON.stringify(data);
  fs.writeFileSync(path.join(fileDir, 'winmeta.sdb'), winMeata);
}

// 追加XLS数据
async function appendXLS(_:MenuItem, win: BrowserWindow) {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: '全部文件', extensions: ['xls', 'xlsx']}],
    properties: ['openFile', 'createDirectory', 'multiSelections', 'dontAddToRecent']
  })
  if (!canceled) {
    let data: Array<any> = [];
    filePaths.forEach((path) => {
      const workSheetsFromFile = xlsx.parse(path);
      let trueData = workSheetsFromFile[0].data;
      trueData.shift();
      trueData.map((item) => {
        data.push(item);
      })
    });
    win.webContents.send('dialog:appendXLS', data);
  }
}

export { importXLS, saveFile, saveMeta, appendXLS, saveWinMeat }