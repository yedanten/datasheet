import { app, dialog, BrowserWindow,MenuItem } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as csv from 'csvtojson';
import { encryptData, decryptData } from './aes'


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
			}).fromString(data).then((csvRow: any) => {
				win.webContents.send('dialog:importCSV', csvRow);
			});			
		})
	}

}


async function saveFile(data: any) {
	const plainData = JSON.stringify(data);

	const fileData = encryptData('test', plainData);	// key, data

	const { canceled, filePath } = await dialog.showSaveDialog({
		defaultPath: '~/data.sdb',
		filters: [{ name: '全部文件', extensions: ['*']}],
		properties: ['dontAddToRecent', 'createDirectory']
	});
	if (!canceled) {
		fs.writeFileSync(filePath, fileData);
	} 
}

export { importCSV, saveFile }