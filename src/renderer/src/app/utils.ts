import Handsontable, { CellRange } from 'handsontable/base';
function checkColSelectionDuplicate(ranges: CellRange, comparator: any): boolean {
  //console.log(comparator);
  let result = false;
  for (let i = 0; i < ranges.to.row; i++) {
    if (comparator(i, ranges.to.col).duplicateCheck) {
      return true;
    }
  }
  return result;
}

export { checkColSelectionDuplicate }