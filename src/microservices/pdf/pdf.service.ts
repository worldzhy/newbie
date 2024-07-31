import {Injectable} from '@nestjs/common';
import {PDFDocument, PDFPageDrawTextOptions} from 'pdf-lib';
import {readFileSync} from 'fs';

@Injectable()
export class PdfService {
  async drawTextOnPage(params: {
    pdfPath: string;
    pdfPage: number;
    texts: {text: string; options: PDFPageDrawTextOptions}[];
  }) {
    const pdfBytes = readFileSync(params.pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPage(params.pdfPage - 1);

    for (let i = 0; i < params.texts.length; i++) {
      page.drawText(params.texts[i].text, params.texts[i].options);
    }

    return await pdfDoc.save();
  }
}
