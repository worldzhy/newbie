import {Injectable} from '@nestjs/common';
import XLSX from 'xlsx';

@Injectable()
export class XLSXService {
  static read(filepath: string) {
    const workbook = XLSX.readFile(filepath);
  }
}
