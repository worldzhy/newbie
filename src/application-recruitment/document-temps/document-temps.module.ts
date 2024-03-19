import { Module } from '@nestjs/common';
import { DocumentTemplateService } from './document-temps.service';
import { DocumentTemplateController } from './document-temps.controller';

@Module({
  controllers: [DocumentTemplateController],
  providers: [DocumentTemplateService],
  exports: [DocumentTemplateService],
})
export class DocumentTemplateModule {}
