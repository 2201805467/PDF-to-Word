import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';

test('extracts a real Arabic PDF with mixed numbers into readable text and Word', async ({ page, context }) => {
 const source = await context.newPage();
 await source.setContent(`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><style>body{font:20px Tahoma}p{margin:20px}</style><body>
 <p>جامعة طرابلس - طرابلس</p>
 <p>قسم علوم الحاسوب</p>
 <p>الرقم: 2201805467</p>
 <p>التاريخ: 21/10/2026</p>
 <p>المعدل: 65.89</p>
 <p>مشروع PDF to Word باللغة الأم</p>
 </body></html>`);
 await source.evaluate(() => document.fonts.ready);
 const buffer = await source.pdf();
 await source.close();
 await page.goto('/');
 await page.locator('#file').setInputFiles({name:'arabic.pdf', mimeType:'application/pdf', buffer});
 await expect(page.locator('#convert')).toBeEnabled();
 await page.locator('#convert').click();
 const expected = ['جامعة طرابلس - طرابلس','قسم علوم الحاسوب','الرقم: 2201805467','التاريخ: 21/10/2026','المعدل: 65.89','مشروع PDF to Word باللغة الأم'];
 for (const line of expected) await expect(page.locator('#preview')).toHaveValue(new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
 const waiting=page.waitForEvent('download'); await page.locator('#download').click();
 const downloaded=await waiting;
 const xml=strFromU8(unzipSync(await readFile(await downloaded.path()))['word/document.xml']);
 expect(xml).toContain('جامعة طرابلس');
 expect(xml).toContain('2201805467');
});
