import { Component, afterNextRender, ViewChild, inject } from '@angular/core';
import { IpcService } from './ipc.service';
import Handsontable, { CellRange } from 'handsontable/base';
import { HotTableRegisterer } from '@handsontable/angular';
import { MenuItemConfig, DetailedSettings } from 'handsontable/plugins/contextMenu';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from './components/modal/modal.component';
import { checkColSelectionDuplicate } from './utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'safe sheet';
  private modalService = inject(NgbModal);

  constructor(private ipcService: IpcService) {
    afterNextRender(async () => {
      const value = await window.electronAPI.onInitData();
      if (value.length > 0) {
        this.updateTabel(JSON.parse(value));
      }
    });

  }

  ngOnInit() {
    window.electronAPI.onGetData(() => {
      const colHeaders: Array<any> = this.hotRegisterer.getInstance(this.id).getColHeader();
      const saveData: Array<any> = this.hotRegisterer.getInstance(this.id).getData();
      saveData.unshift(colHeaders);
      window.electronAPI.saveData(saveData);
    });
    window.electronAPI.importCSV((value: Array<any>) => {
      this.updateTabel(value);
    });
    
  }

  ngAfterViewInit() {
    this.hotRegisterer.getInstance(this.id).addHook('afterSelection', (...e) => {
      if (e[0] >= 0 && e[1] >= 0) {
        console.log(this.hotRegisterer.getInstance(this.id).getCellMeta(e[0], e[1]));
        //console.log(this.hotRegisterer.getInstance(this.id).getSchema());
      }
      
    });
    this.hotRegisterer.getInstance(this.id).addHook('afterCreateRow', (...e) => {
      console.log(e);
    });
    
  }

  private checkDuplicate(colIndex: number) {
    console.log(this.hotRegisterer.getInstance(this.id).getDataAtCol(colIndex));
  }

  private updateTabel(value: Array<any>) {
    this.hotRegisterer.getInstance(this.id).updateSettings({
      colHeaders:value[0]
    });
    value.shift();
    this.hotRegisterer.getInstance(this.id).loadData(value);
  }

  contextMenuSettings: DetailedSettings = {
    items: {
      row_above: {},
      row_below: {},
      sp1: '---------' as MenuItemConfig,
      col_left: {},
      col_right: {},
      sp2: '---------' as MenuItemConfig,
      remove_row: {},
      remove_col: {},
      undo: {},
      redo: {},
      sp3: '---------' as MenuItemConfig,
      make_read_only: {},
      sp4: '---------' as MenuItemConfig,
      alignment: {},
      copy: {},
      cut: {},
      sp5: '---------' as MenuItemConfig,
      col_header_change: {
        name: '修改列名',
        disabled() {
          return this.getSelectedLast()?.[0] !== -1;
        },
        callback: () => {
          const selectedCell: Array<number> = <Array<number>>this.hotRegisterer.getInstance(this.id).getSelectedLast();
          let colHeaders: Array<string> = <Array<string>>this.hotRegisterer.getInstance(this.id).getColHeader();
          const modalRef = this.modalService.open(ModalComponent);
          modalRef.componentInstance.name = this.hotRegisterer.getInstance(this.id).getColHeader(selectedCell[1]);
          modalRef.result.then(
            (result) => {
              colHeaders[selectedCell[1]] = result;
              this.hotRegisterer.getInstance(this.id).updateSettings({
                colHeaders: colHeaders
              });
            },
            (reason) => {
              console.log(reason);
            });
        }
      },
      check_duplicate: {
        name() {
         let label = '重复值检查';
         const ranges: CellRange = <CellRange>this.getSelectedRangeLast();
         const atLeastOneDuplicate = checkColSelectionDuplicate(ranges, (row: number, col: number) => this.getInstance().getCellMeta(row, col));
         if (atLeastOneDuplicate) {
          return `<span class="selected">${String.fromCharCode(10003)}</span>${label}`;
         }
         return label;
        },
        callback: () => {
          const ranges: CellRange = <CellRange>this.hotRegisterer.getInstance(this.id).getSelectedRangeLast();
          const atLeastOneDuplicate = checkColSelectionDuplicate(ranges, (row: number, col: number) => this.hotRegisterer.getInstance(this.id).getCellMeta(row, col));
          for (let i = 0; i < ranges.to.row; i++) {
            this.hotRegisterer.getInstance(this.id).setCellMeta(i, ranges.to.col, 'duplicateIgnore', false);
            this.hotRegisterer.getInstance(this.id).setCellMeta(i, ranges.to.col, 'duplicateCheck', !atLeastOneDuplicate);
          }
          if (!atLeastOneDuplicate) {
            this.checkDuplicate(ranges.to.col);
          }
        }
      }
    }
  }

  private hotRegisterer = new HotTableRegisterer();
  id = 'hotInstance';
  hotSettings: Handsontable.GridSettings = {
    colHeaders: true,
    rowHeaders: true,                           //显示列标题
    width: '100%',                              //容器宽度
    stretchH: 'all',                            //自适应列宽
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
    contextMenu: this.contextMenuSettings,      //允许右键菜单
    themeName: 'ht-theme-main',                 //主题
    licenseKey: 'non-commercial-and-evaluation'
  }



  clickDevTools() {
    this.ipcService.openDevTools();
  }
}
