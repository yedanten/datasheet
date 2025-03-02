import { Component, afterNextRender, ViewChild, inject, OnInit } from '@angular/core';
import Handsontable, { CellRange } from 'handsontable/base';
import { HotTableRegisterer } from '@handsontable/angular';
import { MenuItemConfig, DetailedSettings } from 'handsontable/plugins/contextMenu';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../Modal/modal.component';
import { ChangepassComponent } from '../ChangePass/changepass.component';
import { checkColSelectionDuplicate, CustomEditor, escapeHTML, extractTextFromHTML, getRandColor } from '../../utils';
import { TextEditor } from 'handsontable/editors/textEditor';
import { BaseRenderer, textRenderer, htmlRenderer } from 'handsontable/renderers';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  private modalService = inject(NgbModal);
  private init = false;

  // 在angular框架加载时注册事件
  constructor() {
    // 当所有组件都已渲染到 DOM 时运行一次
    // 加载数据，重设单元格元数据必须在表格已经渲染好了的情况下完成
    afterNextRender(async () => {
      const value = await window.electronAPI.onInitData();
      if (value.length > 0) {
        this.init = true;
        this.updateTabel(JSON.parse(value));
      }
      const cellsMeta = await window.electronAPI.onInitMeta();
      if (cellsMeta.length > 0) {
        const cellsMetaObj = JSON.parse(cellsMeta);
        cellsMetaObj.forEach((element: any) => {
          this.hotRegisterer.getInstance(this.id).setCellMetaObject(element.row, element.col, {duplicateCheck: element.duplicateCheck, duplicateIgnore:element.duplicateIgnore})
        });
      }
      
      
    });

  }

  // 在组件初始化时注册事件
  // rendener与主进程通信事件监听可以提前设置
  ngOnInit() {
    window.electronAPI.onGetData(() => {
      const colHeaders: Array<any> = this.hotRegisterer.getInstance(this.id).getColHeader();
      const saveData: Array<any> = this.hotRegisterer.getInstance(this.id).getData();
      saveData.unshift(colHeaders);
      const cellsMeta: Array<any> = this.hotRegisterer.getInstance(this.id).getCellsMeta();
      window.electronAPI.saveData(saveData);
      window.electronAPI.saveMeta(cellsMeta);
      window.electronAPI.saveWinMeta();
    });
    window.electronAPI.importXLS((value: Array<any>) => {
      this.updateTabel(value);
    });
    window.electronAPI.appendXLS((value: Array<any>) => {
      this.appendTabel(value);
    });
    window.electronAPI.onChangePass(() => {
      const modalRef = this.modalService.open(ChangepassComponent);
      modalRef.result.then(
        (result) => {
          window.electronAPI.onChangeKey(result);
          window.electronAPI.notClose();
        },
        (reason) => {
          console.log(reason);
      });
    });
    
  }

  // 页面初始化时注册事件
  ngAfterViewInit() {
    // 创建行补齐重复值检查属性
    this.hotRegisterer.getInstance(this.id).addHook('afterCreateRow', (index: number, amount: number, source?: string) => {
      window.electronAPI.notClose();
      const totalCol = this.hotRegisterer.getInstance(this.id).countCols();
      let op = -1;
      if (source === 'ContextMenu.rowAbove') {
        op = 1;
      }
      for (let i = 0; i < totalCol; i++) {
        const originCell = this.hotRegisterer.getInstance(this.id).getCellMeta(index+op, i);
        if (typeof originCell.duplicateIgnore !== 'undefined') {
          this.hotRegisterer.getInstance(this.id).setCellMeta(index, i, 'duplicateIgnore', originCell.duplicateIgnore);
          this.hotRegisterer.getInstance(this.id).setCellMeta(index, i, 'duplicateCheck', originCell.duplicateCheck);
        }
      }
    });


    // 创建、删除、移动行/列后，都将触发数据待保存
    this.hotRegisterer.getInstance(this.id).addHook('afterCreateCol', (...e) => {
      window.electronAPI.notClose();
    });

    this.hotRegisterer.getInstance(this.id).addHook('afterRemoveCol', (...e) => {
      window.electronAPI.notClose();
    });

    this.hotRegisterer.getInstance(this.id).addHook('afterRemoveRow', (...e) => {
      window.electronAPI.notClose();
    });

    this.hotRegisterer.getInstance(this.id).addHook('afterColumnMove', (...e) => {
      window.electronAPI.notClose();
    });

    this.hotRegisterer.getInstance(this.id).addHook('afterRowMove', (...e) => {
      window.electronAPI.notClose();
    });


    // 编辑数据后的检查
    this.hotRegisterer.getInstance(this.id).addHook('afterChange', (change: any, source: string) => {
      // 由于导入CSV与打开应用从已有数据加载是同样的事件
      // 添加一个值用于判断情况。
      // 打开应用加载已有数据不触发数据待保存
      if (this.init === true && source === 'loadData') {
        this.init = false;
      } else {
        window.electronAPI.notClose();
      }

      // 其他编辑情况，比如编辑粘贴移动等，针对单个单元格的编辑处理
      if (source !== 'loadData') {
        // 由于可能存在 插入/删除 行/列 行为后，再次编辑单元格，需要把视觉行列索引转为物理行列索引
        const row = this.hotRegisterer.getInstance(this.id).toPhysicalRow(change[0][0]);
        const col = this.hotRegisterer.getInstance(this.id).toPhysicalColumn(change[0][1]);
      }
    });

    // 列宽最大值限制
    this.hotRegisterer.getInstance(this.id).addHook('modifyColWidth', (width: number, column: number, source?: string) => {
      if(width > 340) {
        return 340;
      }
    });

    // 选中单元格后触发,调试用
    /*this.hotRegisterer.getInstance(this.id).addHook('afterSelection', (...e) => {
      if (e[0] !== -1) {
        console.log(this.hotRegisterer.getInstance(this.id).getDataAtCol(3));
      };
    });*/
  }

  // 重复数据添加相同背景色
  private setDuplicateColor(colIndex: number, duplicateMap: any) {
    this.hotRegisterer.getInstance(this.id).suspendExecution();
    this.hotRegisterer.getInstance(this.id).suspendRender();

    const rows = Object.keys(duplicateMap);
    let reloadRows = new Set();

    rows.forEach((key: string) => {
      const row = parseInt(key)-1;
      reloadRows.add(row);
      const keyCell = this.hotRegisterer.getInstance(this.id).getCell(row, colIndex);
      const keyCellSp = keyCell!.getElementsByTagName('span');

      for (let i=0; i < keyCellSp.length; i++) {
        const plain = keyCellSp[i].innerText.trim();
        duplicateMap[key].forEach((value: number) => {
          reloadRows.add(value-1);
          const duCell = this.hotRegisterer.getInstance(this.id).getCell(value-1, colIndex);
          const duCellSp = duCell!.getElementsByTagName('span');
          let duCellSpDataArray = [];
          for (let j=0; j < duCellSp.length; j++) {
            duCellSpDataArray.push(duCellSp[j].innerText);
          }
          const duIndex = duCellSpDataArray.indexOf(plain);
          if(duIndex === -1) {
            return;
          }

          if (duCellSp[duIndex].style.background != '') {
            keyCellSp[i].style.background = duCellSp[duIndex].style.background;
          } else {
            keyCellSp[i].style.background = getRandColor();
            duCellSp[duIndex].style.background = keyCellSp[i].style.background;
          }
        });
      }
    });

    // 只修改render属性，无法与table控件的data源关联，调用一次setDataAtCell刷新绑定的数据源
    const d = <Array<number>>Array.from(reloadRows);
    d.forEach((value) => {
      const newCellData = this.hotRegisterer.getInstance(this.id).getCell(value, colIndex)!.innerHTML;
      this.hotRegisterer.getInstance(this.id).setDataAtCell(value, colIndex, newCellData, 'setColor');
    });

    this.hotRegisterer.getInstance(this.id).resumeRender();
    this.hotRegisterer.getInstance(this.id).resumeExecution();
  }

  // 检查单元格重复情况
  // 根据第二个参数是否有传区分整列开启重复值检查与单个单元格触发重复值检查
  // 检查逻辑：选中的该列，每个单元格按 ; 分隔元素，如果该单元格是空的就跳过。
  //          在排除该元素所属单元格后，与其他元素对比，将匹配一致的元素所属单元格加入list。
  //          最后返回该list给调用方
  private checkDuplicate(colIndex: number, waitingDataCellMeta?: Array<any>): object {
    let duplicateObject = Object.create(null);
    const originColData = this.hotRegisterer.getInstance(this.id).getDataAtCol(colIndex);
    const colData = originColData.map((value) => {
      return extractTextFromHTML(value).trim();
    });

    if (typeof waitingDataCellMeta === 'undefined') {
      for (let i=0; i < colData.length; i++) {
        if (colData[i] === null || colData[i] === '') {
          continue;
        }
        const currentCellDataArray = colData[i].split(';');
        for (let j=(i+1); j < colData.length; j++ ) {
          const next = colData[j].split(';');
          const nextCellDataArray = next.map((value) => {
            return value.trim();
          });
          const flag = currentCellDataArray.some((value) => {
            return nextCellDataArray.includes(value.trim());
          });
          if (flag) {
            if(typeof (duplicateObject[i+1]) === 'undefined') duplicateObject[i+1] = [];
            duplicateObject[i+1].push(j+1);
          }
        }
      }
    } else {
      let waitData: Array<any> = [];
      waitingDataCellMeta.forEach((cellMeta: any, rowIndex: number) => {
        if(cellMeta === null || cellMeta === '') {
          return;
        }
        const cellData = this.hotRegisterer.getInstance(this.id).getDataAtCell(cellMeta.visualRow, cellMeta.visualCol);
        const cellDataStr = extractTextFromHTML(cellData);
        const spData: Array<string> = cellDataStr.split(';');
        spData.forEach((spDataElement: string) => {
          let diffData = [...colData];
          delete diffData[cellMeta.visualRow];
          const found = diffData.findIndex((colDataElement: string | undefined | null, diffIndex: number) => {
            if (typeof (colDataElement) !== 'undefined' && colDataElement !== null && colDataElement !== '') {
              const expr = new RegExp(`(^${spDataElement};|;${spDataElement};|;${spDataElement}$)`);
              const flag =  expr.test(colDataElement) || (colDataElement === spDataElement);
              if (flag) {
                if(typeof (duplicateObject[cellMeta.visualRow+1]) === 'undefined') duplicateObject[cellMeta.visualRow+1] = [];
                if (!duplicateObject[cellMeta.visualRow+1].includes(diffIndex+1)) {
                  duplicateObject[cellMeta.visualRow+1].push(diffIndex+1);
                }
              }
            }
          });
        });
      });
    }
    return duplicateObject;
  }

  // 显示重复值检查窗口
  private showDuplicateWindow(colIndex: number, duplicateMap: any) {
    let data: any = [];
    const rows = Object.keys(duplicateMap);
    rows.forEach((key: string) => {
      let info: any =[];
      duplicateMap[key].forEach((item: number) => {
        info.push({
          row: item,
          col: colIndex,
          cellData: extractTextFromHTML(this.hotRegisterer.getInstance(this.id).getDataAtCell(item-1, colIndex)),
          cellMeta: this.hotRegisterer.getInstance(this.id).getCellMeta(item-1, colIndex)
        });
      });
      data.push({
        row_no: key,
        dupCellsInfo: info,
        selfCellData: extractTextFromHTML(this.hotRegisterer.getInstance(this.id).getDataAtCell(parseInt(key)-1, colIndex))
      });
    });
    window.electronAPI.openDupWindow(data);
  }

  // 重写更新表格逻辑，数据集第一行设置到表头
  private updateTabel(value: Array<any>) {
    this.hotRegisterer.getInstance(this.id).suspendExecution();
    this.hotRegisterer.getInstance(this.id).suspendRender();
    this.hotRegisterer.getInstance(this.id).updateSettings({
      colHeaders:value[0]
    });
    value.shift();
    this.hotRegisterer.getInstance(this.id).loadData(value);
    this.hotRegisterer.getInstance(this.id).resumeRender();
    this.hotRegisterer.getInstance(this.id).resumeExecution();
  }

  // 追加更新表格数据
  private appendTabel(value: Array<any>) {
    this.hotRegisterer.getInstance(this.id).suspendExecution();
    this.hotRegisterer.getInstance(this.id).suspendRender();

    let currentData = this.hotRegisterer.getInstance(this.id).getSourceData();
    for (let i = 0; i < this.hotRegisterer.getInstance(this.id).countEmptyRows(true); i++) {
      currentData.pop()
    }
    currentData = currentData.concat(value);
    this.hotRegisterer.getInstance(this.id).loadData(currentData);

    this.hotRegisterer.getInstance(this.id).resumeRender();
    this.hotRegisterer.getInstance(this.id).resumeExecution();
  }

  // 表格右键菜单，追加修改列名和重复值检测选项
  // 默认实现不能直接追加，只好一个个补上
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
          return this.getSelectedLast()?.[0] !== -1;  // 如果右键的不是列头，禁用该选项
        },
        callback: () => {
          // 弹出模态框
          const selectedCell: Array<number> = <Array<number>>this.hotRegisterer.getInstance(this.id).getSelectedLast();
          let colHeaders: Array<string> = <Array<string>>this.hotRegisterer.getInstance(this.id).getColHeader();
          const modalRef = this.modalService.open(ModalComponent);
          modalRef.componentInstance.name = this.hotRegisterer.getInstance(this.id).getColHeader(selectedCell[1]);
          modalRef.result.then(
            (result) => {
              colHeaders[selectedCell[1]] = result;
              window.electronAPI.notClose();
              this.hotRegisterer.getInstance(this.id).updateSettings({
                colHeaders: colHeaders
              });
            },
            (reason) => {
              console.log(reason);
            });
        }
      },
      duplicate: {
        name: '重复值检查',
        submenu: {
          items: [
            {
              key: 'duplicate:enabled',
              name() {
                // 右键的是列头还是单个单元格，有不同的渲染逻辑。
                // 右键列头，遍历该列单元格，如果有任意单元格的熟悉存在启用标志，渲染文本后面加√
                // 右键单元格，由于存在同时选中多个单元格的情况，只要有一个单元格存在启用标志，，渲染文本后面加√
                // 二者区分原因因为可能存在跨行跨列选取不同的单元格，该表格控件无直接获取选中单元格API，需要自己实现。
                let label = '启用';
                let atLeastOneDuplicate= false;
                const ranges: CellRange = <CellRange>this.getSelectedRangeLast();
                const selected: Array<Array<number>> = <Array<Array<number>>>this.getSelected();
                if (ranges.from.row === -1) {
                  atLeastOneDuplicate = checkColSelectionDuplicate(ranges, (row: number, col: number) => this.getInstance().getCellMeta(row, col));
                } else {
                  findLoop:for (let index = 0; index < selected.length; index += 1) {
                    const [row1, column1, row2, column2] = selected[index]!;
                    const startRow = Math.max(Math.min(row1, row2), 0);
                    const endRow = Math.max(row1, row2);
                    const startCol = Math.max(Math.min(column1, column2), 0);
                    const endCol = Math.max(column1, column2);
                    for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
                      for (let columnIndex = startCol; columnIndex <= endCol; columnIndex += 1) {
                        const seletedCellMeta = this.getCellMeta(rowIndex, columnIndex);
                        if (typeof seletedCellMeta.duplicateIgnore !== 'undefined' && seletedCellMeta.duplicateIgnore === false && seletedCellMeta.duplicateCheck === true) {
                          atLeastOneDuplicate = true;
                          break findLoop;
                        }
                      }
                    }
                  }
                }
                if (atLeastOneDuplicate) {
                  return `<span class="selected">${String.fromCharCode(10003)}</span>${label}`;
                }
                return label;
              },
              callback: () => {
                window.electronAPI.notClose();
                const ranges: CellRange = <CellRange>this.hotRegisterer.getInstance(this.id).getSelectedRangeLast();

                // 给该列所有单元格加检测属性
                if (ranges.from.row === -1) {
                  const atLeastOneDuplicate = checkColSelectionDuplicate(ranges, (row: number, col: number) => this.hotRegisterer.getInstance(this.id).getCellMeta(row, col));
                  for (let i = 0; i <= ranges.to.row; i++) {


                    const originData = extractTextFromHTML(this.hotRegisterer.getInstance(this.id).getDataAtCell(i, ranges.to.col));
                    const originDataArray = originData.split(';');
                    const newDataArray = originDataArray.map((value: string) => {
                      if (value === null || value === '') {
                        return null;
                      }
                      return '<span>'+escapeHTML(value)+'</span>';
                    });
                    this.hotRegisterer.getInstance(this.id).setDataAtCell(i, ranges.to.col, newDataArray.join(';'));

                    this.hotRegisterer.getInstance(this.id).setCellMeta(i, ranges.to.col, 'duplicateIgnore', false);
                    this.hotRegisterer.getInstance(this.id).setCellMeta(i, ranges.to.col, 'duplicateCheck', !atLeastOneDuplicate);
                  }

                  if (!atLeastOneDuplicate) {
                    const checkResult = this.checkDuplicate(ranges.to.col);
                    if(Object.keys(checkResult).length > 0) {
                      this.showDuplicateWindow(ranges.to.col, checkResult);
                      this.setDuplicateColor(ranges.to.col, checkResult);
                    }
                  }
                }
              },
              disabled: () => {
                const ranges: CellRange = <CellRange>this.hotRegisterer.getInstance(this.id).getSelectedRangeLast();
                if (ranges.from.row === -1) {
                  return false;
                } else {
                  return true;
                }
              }
            },
            {
              key: 'duplicate:check',
              name: '检查',
              disabled: () => {
                let atLeastOneDuplicate= false;
                const ranges: CellRange = <CellRange>this.hotRegisterer.getInstance(this.id).getSelectedRangeLast();
                const selected: Array<Array<number>> = <Array<Array<number>>>this.hotRegisterer.getInstance(this.id).getSelected();
                if (ranges.from.row === -1) {
                  atLeastOneDuplicate = checkColSelectionDuplicate(ranges, (row: number, col: number) => this.hotRegisterer.getInstance(this.id).getCellMeta(row, col));
                } else {
                  findLoop:for (let index = 0; index < selected.length; index += 1) {
                    const [row1, column1, row2, column2] = selected[index]!;
                    const startRow = Math.max(Math.min(row1, row2), 0);
                    const endRow = Math.max(row1, row2);
                    const startCol = Math.max(Math.min(column1, column2), 0);
                    const endCol = Math.max(column1, column2);
                    for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
                      for (let columnIndex = startCol; columnIndex <= endCol; columnIndex += 1) {
                        const seletedCellMeta = this.hotRegisterer.getInstance(this.id).getCellMeta(rowIndex, columnIndex);
                        if (typeof seletedCellMeta.duplicateIgnore !== 'undefined' && seletedCellMeta.duplicateIgnore === false && seletedCellMeta.duplicateCheck === true) {
                          atLeastOneDuplicate = true;
                          break findLoop;
                        }
                      }
                    }
                  }
                }
                return !atLeastOneDuplicate;
              },
              callback: () => {
                const ranges: CellRange = <CellRange>this.hotRegisterer.getInstance(this.id).getSelectedRangeLast();
                const selected: Array<Array<number>> = <Array<Array<number>>>this.hotRegisterer.getInstance(this.id).getSelected();
                if (ranges.from.row === -1) {
                  const checkResult = this.checkDuplicate(ranges.to.col);
                  this.showDuplicateWindow(ranges.to.col, checkResult);
                  this.setDuplicateColor(ranges.to.col, checkResult);
                } else {
                  let waitingData = [];
                  for (let index = 0; index < selected.length; index += 1) {
                    const [row1, column1, row2, column2] = selected[index]!;
                    const startRow = Math.max(Math.min(row1, row2), 0);
                    const endRow = Math.max(row1, row2);
                    const startCol = Math.max(Math.min(column1, column2), 0);
                    const endCol = Math.max(column1, column2);

                    for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
                      for (let columnIndex = startCol;columnIndex <= endCol; columnIndex += 1) {
                        const seletedCellMeta = this.hotRegisterer.getInstance(this.id).getCellMeta(rowIndex, columnIndex);
                        if (typeof seletedCellMeta.duplicateIgnore !== 'undefined') {
                          waitingData.push(this.hotRegisterer.getInstance(this.id).getCellMeta(rowIndex, columnIndex));
                        }
                      }
                    }
                  }
                  const checkResult = this.checkDuplicate(waitingData[0].col, waitingData);
                  if(Object.keys(checkResult).length > 0) {
                    this.showDuplicateWindow(ranges.to.col, checkResult);
                    this.setDuplicateColor(ranges.to.col, checkResult);
                  }
                }
              }
            }
          ]
        }
      }
    }
  }

  // 构造表格基础熟悉
  private hotRegisterer = new HotTableRegisterer();
  id = 'hotInstance';
  hotSettings: Handsontable.GridSettings = {
    colHeaders: true,                           //显示列标题
    rowHeaders: true,                           //显示行标题
    width: '100%',                              //容器宽度
    stretchH: 'all',                            //自适应列宽
    filters: true,                              //过滤器
    dropdownMenu: true,                         //下拉式菜单
    columnSorting: true,                        //列排序
    language: 'zh-CN',                          //语言
    maxRows: 999999,                            //最大行数
    minRows: 1,                                 //最小行数
    minCols: 1,                                 //最小列数
    minSpareRows: 2,                            //最小底部空白行数
    startRows:1,                                // 修改起始默认最小列数
    startCols:1,                                // 修改起始默认最小行数
    // 控件BUG，行列拖拽后在插入行列，将会引起列头绑定失败
    //manualColumnMove: true,                     //拖拽列
    //manualRowMove: true,                        //拖拽行
    manualColumnResize: true,                   //允许手动拉伸列宽
    manualRowResize: true,                      //允许手动拉伸行高
    bindRowsWithHeaders: true,                  //绑定行标题
    contextMenu: this.contextMenuSettings,      //允许右键菜单
    renderer: 'html',
    editor:CustomEditor,
    themeName: 'ht-theme-main',                 //主题
    licenseKey: 'non-commercial-and-evaluation', //白嫖lincese
  }
}
