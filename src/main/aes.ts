import * as CryptoJS from 'crypto-js';
import { Buffer } from 'node:buffer';

// AES-256-CBC PKCS7padding

function encryptData(keyStr: string, plainData: string): string {
	let buff = Buffer.alloc(32, 'a');	// key长度不够后面补a
	buff.write(keyStr,0);
	keyStr = buff.toString();

	let encodetext = CryptoJS.AES.encrypt(plainData, CryptoJS.enc.Utf8.parse(keyStr), {
		iv: CryptoJS.enc.Utf8.parse(keyStr),
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	}).toString();
	return encodetext;
}

async function decryptData(keyStr: string, enData: string): Promise<any> {
	let decodetext = "";
	let buff = Buffer.alloc(32, 'a');
	buff.write(keyStr,0);
	keyStr = buff.toString();
	const text = enData.replace(/[\r\n]/g,"");

	const p = new Promise((resolve, reject) => {
		try {
			const dec = CryptoJS.AES.decrypt(text, CryptoJS.enc.Utf8.parse(keyStr), {
				iv: CryptoJS.enc.Utf8.parse(keyStr),
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7,
			}).toString(CryptoJS.enc.Utf8);
			return resolve(dec);
		} catch (e) {
			console.log(1);
			console.log(e)
			reject(e);
		}
		
	});
	return p;
}

export { encryptData, decryptData }