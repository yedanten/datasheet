import { ipcRenderer, contextBridge } from 'electron';

console.log('preload.js loaded');

contextBridge.exposeInMainWorld('electronAPI',{
  onInitData: () => ipcRenderer.invoke('init-data'),
  onGetData: (callback: any) => ipcRenderer.on('get-data', (_event) => callback()),
  importCSV: (callback: any) => ipcRenderer.on('dialog:importCSV', (_event, value) => callback(value)),
  saveData: (value: any) => ipcRenderer.send('save-data', value),
  openDupWindow: (value: any) => ipcRenderer.send('dup-window', value),
  setDupObj: (callback: any) => ipcRenderer.on('set-dupObj', (_event, value) => callback(value)),
  notClose: () => ipcRenderer.send('not-close'),
  onGetPassword: () => ipcRenderer.invoke('get-pass'),
  onVerifyPassword: (value: string) => ipcRenderer.invoke('verify-pass', value),
  onFirstStartup: () => ipcRenderer.invoke('first-check'),
  saveMeta: (value: any) => ipcRenderer.send('save-meta', value),
  onInitMeta: () => ipcRenderer.invoke('init-meta'),
  onChangePass: (callback: any) => ipcRenderer.on('change-pass', (_event) => callback()),
  onChangeKey: (value: string) => ipcRenderer.invoke('change-key', value)
})