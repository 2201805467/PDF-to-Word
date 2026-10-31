import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePages, textLines, makeWord, isRTL, normalizeArabic, directionalRuns } from '../src/document.js';

test('page selection accepts Arabic digits, deduplicates, and rejects invalid ranges', () => {
 assert.deepEqual(parsePages('١-٣، ٥, 2',5),[1,2,3,5]);
 assert.deepEqual(parsePages('',3),[1,2,3]);
 for(const range of ['0','3-1','1-6','2,','a','1.5']) assert.throws(()=>parsePages(range,5));
});

const positioned = (str, x, width, dir = 'rtl') => ({ str, dir, width, height: 12, transform: [12,0,0,12,x,100] });
test('Arabic glyph fragments are joined in geometric reading order without invented spaces', () => {
 // Left-to-right painting order, right-to-left reading order; each letter is a PDF item.
 const word = ['\uFEE1', '\uFEFC', '\uFEB3'];
 const items = word.map((str, i) => positioned(str, i * 10, 10));
 assert.deepEqual(textLines(items), ['سلام']);
 assert.deepEqual(textLines([...items].reverse()), ['سلام']);
 assert.equal(normalizeArabic('ﻣﺮﺣﺒﺎ'), 'مرحبا');
 assert.equal(normalizeArabic('ی ھ'), 'ی ھ'); // Do not guess alternative Unicode mappings.
});

test('mixed Arabic, English and numeric runs keep their own reading direction', () => {
 const items = [positioned('2201805467',0,80,'ltr'),positioned(' ',80,5,'ltr'),positioned('الرقم:',85,40)];
 assert.deepEqual(textLines(items), ['الرقم: 2201805467']);
 const mixed = [positioned('باللغة العربية',0,75),positioned(' ',75,5,'ltr'),positioned('PDF',80,20,'ltr'),positioned(' ',100,5,'ltr'),positioned('to',105,10,'ltr'),positioned(' ',115,5,'ltr'),positioned('Word',120,30,'ltr'),positioned(' ',150,5,'ltr'),positioned('مشروع',155,40)];
 assert.deepEqual(textLines(mixed), ['مشروع PDF to Word باللغة العربية']);
 const text='التاريخ: 21/10/2026 والمعدل: 65.89 و PDF to Word';
 const runs=directionalRuns(text);
 assert.equal(runs.map(run=>run.text).join(''),text);
 for(const value of ['21/10/2026','65.89','PDF to Word']) assert.ok(runs.some(run=>run.text.includes(value)&&!run.rtl));
 assert.ok(runs.some(run=>run.text.includes('التاريخ')&&run.rtl));
});

test('DOCX numeric runs explicitly remain LTR inside Arabic paragraphs', async () => {
 const {unzipSync,strFromU8}=await import('fflate');
 const blob=await makeWord([{lines:['الرقم: 2201805467 والتاريخ: 21/10/2026 والمعدل: 65.89']}]);
 const xml=strFromU8(unzipSync(new Uint8Array(await blob.arrayBuffer()))['word/document.xml']);
 for(const value of ['2201805467','21/10/2026','65.89']) {
  const run=[...xml.matchAll(/<w:r>([\s\S]*?)<\/w:r>/g)].find(match=>match[1].includes(value))?.[1];
  assert.ok(run);assert.match(run, /<w:rtl w:val="false"\/>/);
 }
 assert.match(xml, /w:cs="Arial"/);assert.match(xml, /w:szCs w:val="24"/);
});
test('line reconstruction respects PDF line breaks and baseline changes',()=>{
 assert.deepEqual(textLines([{str:'Hello',transform:[1,0,0,1,0,100],height:10},{str:'world',transform:[1,0,0,1,30,100],hasEOL:true},{str:'مرحبا',transform:[1,0,0,1,0,80],height:10},{str:'Next',transform:[1,0,0,1,0,60],height:10}]),['Hello world','مرحبا','Next']);
 assert.equal(isRTL('مرحبا'),true); assert.equal(isRTL('Hello'),false);
});
test('Word output contains editable text, RTL metadata, and page boundaries',async()=>{
 const {unzipSync,strFromU8}=await import('fflate');
 const blob=await makeWord([{lines:['Hello world']},{lines:['مرحبا بالعالم']}]);
 const zip=unzipSync(new Uint8Array(await blob.arrayBuffer()));
 const xml=strFromU8(zip['word/document.xml']);
 assert.match(xml,/Hello world/);assert.match(xml,/مرحبا بالعالم/);assert.match(xml,/w:bidi/);assert.match(xml,/w:pageBreakBefore/);
});
