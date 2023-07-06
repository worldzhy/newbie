import {Injectable} from '@nestjs/common';
const XLSX = require('xlsx');

@Injectable()
export class XLSXService {
  static read(filepath: string) {
    const workbook = XLSX.readFile(filepath);
  }
}
