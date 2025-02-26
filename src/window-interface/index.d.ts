export interface IElectronAPI {
  onInitData: () => string;
  onGetData: (callback: any) => void;
  importXLS: (callback: any) => void;
  appendXLS: (callback: any) => void;
  saveData: (value: any) => void;
  openDupWindow: (value: any) => void;
  setDupObj: (callback: any) => void;
  notClose: () => void;
  onGetPassword: () => string | null;
  onVerifyPassword: (value: string ) => Promise<boolean>;
  onFirstStartup: () => Promise<boolean>;
  saveMeta: (value: any) => void;
  saveWinMeta: () => void;
  onInitMeta: () => string;
  onChangePass: (callback: any) => void;
  onChangeKey: (value: string) => void;
}
declare global {
  interface Window {
    api: {
      /** Electron ipcRenderer wrapper of send method */
      electronIpcSend: (channel: string, ...arg: any) => void;
      /** Electron ipcRenderer wrapper of sendSync method */
      electronIpcSendSync: (channel: string, ...arg: any) => any;
      /** Electron ipcRenderer wrapper of on method */
      electronIpcOn: (channel: string, listener: (event: any, ...arg: any) => void) => void;
      /** Electron ipcRenderer wrapper of onOnce method */
      electronIpcOnce: (channel: string, listener: (event: any, ...arg: any) => void) => void;
      /** Electron ipcRenderer wrapper of removeListener method */
      electronIpcRemoveListener: (channel: string, listener: (event: any, arg: any) => void) => void;
      /** Electron ipcRenderer wrapper of removeAllListeners method */
      electronIpcRemoveAllListeners: (channel: string) => void;
    };
    electronAPI: IElectronAPI
  }
}

