import * as fs from 'fs';
import * as path from 'path';

export function readFilesInFolder(folderPath: string) {
  const files: string[] = [];
  const items = fs.readdirSync(folderPath);

  items.forEach((item: any) => {
    const filePath = path.join(folderPath, item);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      files.push(filePath);
    } else if (stats.isDirectory()) {
      readFilesInFolder(filePath);
    }
  });

  return files;
}

export function getFileBaseName(filePath: string) {
  return path.basename(filePath, path.extname(filePath));
}
