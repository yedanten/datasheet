import { app, dialog, BrowserWindow,MenuItem } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as csv from 'csvtojson';
import { encryptData } from './aes';
import * as jschardet from 'jschardet';
import * as iconv from 'iconv-lite';

// 从CSV里导入数据
async function importCSV(_:MenuItem, win: BrowserWindow) {
  await dialog.showMessageBoxSync({
    message: '如遇导入后内容乱码，请提前手动转码为UTF8。自动识别编码不一定准确！！！',
    type: 'warning'
  });
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: '全部文件', extensions: ['csv']}],
    properties: [
      'openFile',
      'createDirectory',
      //'multiSelections',
      'dontAddToRecent'
    ]
  });
  if (!canceled) {
    fs.readFile(filePaths[0], (err, data) => {

      // 猜测文件编码，玄学，GB2312还猜不出来，凑合吧
      const encoding = jschardet.detect(data, { detectEncodings: ['Big5', 'GB2312', 'UTF-8'], minimumThreshold: 0 });
      let convertData = '';
      if (encoding.encoding === null) {
        convertData = iconv.decode(data, 'GB2312');
      } else {
        convertData = iconv.decode(data, encoding.encoding);
      }


      if (err) throw err;
      csv({
        noheader: true,
        output: "csv"
      }).fromString(convertData).then((csvRow: Array<any>) => {
        win.webContents.send('dialog:importCSV', csvRow);
      });
    });
      
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