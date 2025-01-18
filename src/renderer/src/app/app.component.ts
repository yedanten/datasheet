import { Component } from '@angular/core';
import { IpcService } from './ipc.service';
import Handsontable from 'handsontable/base';
import { HotTableRegisterer } from '@handsontable/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-electron-boilerplate';

  constructor(private ipcService: IpcService) {
  }

  
  //data = [];
  ngOnInit() {
    window.electronAPI.onGetData((value: any) => {
      window.electronAPI.saveData(this.hotRegisterer.getInstance(this.id).getData());
    });
    window.electronAPI.importCSV((value: any) => {
      this.hotRegisterer.getInstance(this.id).loadData(value);
    });
  }

  private hotRegisterer = new HotTableRegisterer();
  id = 'hotInstance';
  hotSettings: Handsontable.GridSettings = {
    colHeaders: true,
    rowHeaders: true,                           //显示列标题
    width: '100%',                              //容器宽度
    stretchH: 'all',                            //自适应列宽
    //height: 'auto',                             //容器高度
    filters: true,                              //过滤器
    dropdownMenu: true,                         //下拉式菜单
    columnSorting: true,                        //列排序
    language: 'zh-CN',                          //语言
    maxRows: 999999,                            //最大行数
    minRows: 500,                               //最小行数
    minCols: 20,                                //最小列数
    minSpareRows: 3,                            //最小底部空白行数
    manualColumnMove: true,                     //拖拽列
    manualRowMove: true,                        //拖拽行
    manualColumnResize: true,                   //允许手动拉伸列宽
    manualRowResize: true,                      //允许手动拉伸行高
    bindRowsWithHeaders: true,                  //绑定行标题
    fixedRowsTop: 1,                            //固定顶部第一行
    //persistentState: true,                    //持久化保存
    contextMenu: true,                          //允许右键菜单
    themeName: 'ht-theme-main',                 //主题
    licenseKey: 'non-commercial-and-evaluation'
  }

  clickDevTools() {
    this.ipcService.openDevTools();
  }
  

  //this.hotRegisterer.getInstance(this.id).getData();
}
