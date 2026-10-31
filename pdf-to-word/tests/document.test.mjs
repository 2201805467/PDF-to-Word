import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePages, textLines, makeWord, isRTL } from '../src/document.js';

test('page selection accepts Arabic digits, deduplicates, and rejects invalid ranges', () => {
 assert.deepEqual(parsePages('١-٣، ٥, 2',5),[1,2,3,5]);
 assert.deepEqual(parsePages('',3),[1,2,3]);
 for(const range of ['0','3-1','1-6','2,','a','1.5']) assert.throws(()=>parsePages(range,5));
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
