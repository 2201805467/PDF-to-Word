import { cpSync, mkdirSync } from 'node:fs';
for (const directory of ['cmaps', 'standard_fonts']) {
 mkdirSync(`public/${directory}`, {recursive:true});
 cpSync(`node_modules/pdfjs-dist/${directory}`,`public/${directory}`,{recursive:true});
}
