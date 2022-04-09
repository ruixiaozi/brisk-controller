import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
axios.get('https://www.iana.org/assignments/media-types/media-types.xhtml')
  .then((res) => {
    if (res?.data) {
      const set = new Set<string>();
      const data: string = res?.data;
      const matchs = data.matchAll(/<td>\s*<a.*>(?<miniType>[a-zA-Z0-9\-+_.]+\/[a-zA-Z0-9\-+_.]+)<\/a>/ug);
      let fileData = '/* eslint-disable max-len */\n'
        + '/* eslint-disable max-lines */\n'
        + `/* update ${new Date().toString()} */\n`
        + 'export enum MimeTypeEnum{\n';
      for (const match of matchs) {
        if (match.groups?.miniType) {
          const upMiniType = match.groups?.miniType.replaceAll('.', '_').replaceAll('+', '_')
            .replaceAll('-', '_')
            .replaceAll('/', '_')
            .toUpperCase();
          if (!set.has(upMiniType)) {
            fileData += `  ${upMiniType}='${match.groups?.miniType}',\n`;
            set.add(upMiniType);
          }
        }
      }
      fileData += '}\n';
      fs.writeFileSync(path.join(__dirname, '../enum/MimeTypeEnum.ts'), fileData);
    }
  });
