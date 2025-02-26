import * as CryptoJS from 'crypto-js';
import { Buffer } from 'node:buffer';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';

// AES-256-CBC PKCS7padding

function encryptData(keyStr: string, plainData: string): string {
	let buff = Buffer.alloc(32, 'a');	// key长度不够后面补a
	buff.write(keyStr,0);
	keyStr = buff.toString();
	const iv = CryptoJS.lib.WordArray.random(16);

	let encodetext = CryptoJS.AES.encrypt(plainData, CryptoJS.enc.Utf8.parse(keyStr), {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	}).toString();

	// 转换为可编辑的wordarray，把IV拼接到加密数据最前面
	const encryptWA = CryptoJS.enc.Base64.parse(encodetext);
	const encryptData = iv.clone().concat(encryptWA).toString(CryptoJS.enc.Base64);

	return encryptData;
}

async function decryptData(keyStr: string, enData: string): Promise<any> {
	const fileDir: string = process.platform === 'darwin' ? path.join(<string>process.env.HOME,'.safeSheet'):path.join(<string>process.env.LOCALAPPDATA, 'safeSheet');

	// 填充key
	let buff = Buffer.alloc(32, 'a');
	buff.write(keyStr,0);
	keyStr = buff.toString();

	let iv: any | null = null;
	let enBuffer = Buffer.from(enData, 'base64');

	// 兼容性处理，旧版密文前面没IV
	await fsPromises.access(path.join(fileDir, 'winmeta.sdb'), fs.constants.F_OK)
		.then(() => {
			iv = enBuffer.slice(0,16);
			enBuffer = enBuffer.slice(16);
		}).catch((e) => {
			iv = Buffer.from(keyStr,'utf8');
		})

	const p = new Promise((resolve, reject) => {
		try {
			const dec = CryptoJS.AES.decrypt(enBuffer.toString('base64'), CryptoJS.enc.Utf8.parse(keyStr), {
				iv: CryptoJS.enc.Base64.parse(iv.toString('base64')),
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7,
			}).toString(CryptoJS.enc.Utf8);
			return resolve(dec);
		} catch (e) {
			console.log(e)
			reject(e);
		}
		
	});
	return p;
}

export { encryptData, decryptData }