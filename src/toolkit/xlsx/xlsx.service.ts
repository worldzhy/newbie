import {Injectable} from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class XLSXService {
  private workbook: XLSX.WorkBook;

  loadLocalFile(filePath: string) {
    this.workbook = XLSX.readFile(filePath);
  }

  loadFile(file: Express.Multer.File) {
    this.workbook = XLSX.read(file.buffer);
  }

  getSheets(): string[] {
    return this.workbook.SheetNames;
  }

  getColumns(sheetName: string): string[] {
    const columns: string[] = [];

    const sheet = this.workbook.Sheets[sheetName];
    if (sheet['!ref']) {
      const range = XLSX.utils.decode_range(sheet['!ref']);
      const startRow = range.s.r; // start in the first row

      // walk every column in the range
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let column = 'UNKNOWN ' + C; // <-- replace with your desired default

        const cell = sheet[XLSX.utils.encode_cell({c: C, r: startRow})]; // find the cell in the first row
        if (cell && cell.t) {
          column = XLSX.utils.format_cell(cell);
        }

        columns.push(column);
      }
    }

    return columns;
  }

  getDataRows(sheetName: string): object[] {
    const sheet = this.workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  }
}
