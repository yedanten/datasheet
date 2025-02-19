import { app, dialog, BrowserWindow,MenuItem } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as csv from 'csvtojson';
import { encryptData } from './aes';

// 从CSV里导入数据
async function importCSV(_:MenuItem, win: BrowserWindow) {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: '全部文件', extensions: ['csv']}],
    properties: ['openFile', 'createDirectory', 'dontAddToRecent']
  })
  if (!canceled) {
    fs.readFile(filePaths[0], 'utf8', (err, data) => {
      if (err) throw err;
      csv({
        noheader: true,
        output: "csv"
      }).fromString(data).then((csvRow: Array<any>) => {
        console.log(csvRow);
        win.webContents.send('dialog:importCSV', csvRow);
      });
    })
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

export { importCSV, saveFile, saveMeta }