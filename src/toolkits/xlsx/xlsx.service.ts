import {Injectable} from '@nestjs/common';
var XLSX = require('xlsx');

@Injectable()
export class XLSXService {
  static read(filepath: string) {
    const workbook = XLSX.readFile(filepath);
  }
}
