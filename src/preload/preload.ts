import { ipcRenderer, contextBridge } from 'electron';

console.log('preload.js loaded');

contextBridge.exposeInMainWorld(
  'api', {
    electronIpcSend: (channel: string, ...arg: any) => {
      ipcRenderer.send(channel, arg);
    },
    electronIpcSendSync: (channel: string, ...arg: any) => {
      return ipcRenderer.sendSync(channel, arg);
    },
    electronIpcOn: (channel: string, listener: (event: any, ...arg: any) => void) => {
      ipcRenderer.on(channel, listener);
    },
    electronIpcOnce: (channel: string, listener: (event: any, ...arg: any) => void) => {
      ipcRenderer.once(channel, listener);
    },
    electronIpcRemoveListener:  (channel: string, listener: (event: any, ...arg: any) => void) => {
      ipcRenderer.removeListener(channel, listener);
    },
    electronIpcRemoveAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    }
  }
);

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
  onFirstStartup: () => ipcRenderer.invoke('first-check')
})