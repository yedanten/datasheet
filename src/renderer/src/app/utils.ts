import Handsontable, { CellRange } from 'handsontable/base';
import { TextEditor } from 'handsontable/editors/textEditor';

function checkColSelectionDuplicate(ranges: CellRange, comparator: any): boolean {
  let result = false;
  for (let i = 0; i < ranges.to.row; i++) {
    if (comparator(i, ranges.to.col).duplicateCheck) {
      return true;
    }
  }
  return result;
}

function extractTextFromHTML(htmlString: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || tempDiv.innerText || '';
}

function escapeHTML(html: string): string {
  const elem = document.createElement('div')
  const txt = document.createTextNode(html)
  elem.appendChild(txt)
  return elem.innerHTML;
}

class CustomEditor extends TextEditor {
  declare public TEXTAREA: HTMLInputElement;

  public cellProperties: any | null = null;

  override prepare(row: number, col: number, prop: string | number, td: HTMLTableCellElement, originalValue: any, cellProperties: any) {
    super.prepare(row, col, prop, td, originalValue, cellProperties);
    this.cellProperties = cellProperties;
  }

  override createElements() {
    super.createElements();
    this.TEXTAREA = document.createElement('input');
    this.TEXTAREA.setAttribute('data-hot-input', 'true');
    this.textareaStyle = this.TEXTAREA.style;
    this.TEXTAREA_PARENT.innerText = '';
    this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
  }

  override setValue(newValue?: string | null) {
    if (newValue) {
      this.TEXTAREA.value = extractTextFromHTML(newValue);
    }
  }

  override getValue() {
    if (typeof this.cellProperties.duplicateIgnore !== 'undefined') {
      const cellDataArray = this.TEXTAREA.value.split(';');
      const newCellDataArray = cellDataArray.map((value) => {
        return '<span>'+escapeHTML(value)+'</span>';
      });
      return newCellDataArray.join(';');
    } else {
      return escapeHTML(this.TEXTAREA.value);
    }
  }
}

export { checkColSelectionDuplicate, CustomEditor }