import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';
import { samplePdf } from '../fixture.mjs';

test('Arabic upload, real DOCX download, English text extraction and page validation',async({page})=>{
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 await page.screenshot({path:'test-results/desktop-arabic.png',fullPage:true});
 await page.locator('#file').setInputFiles({name:'example.pdf',mimeType:'application/pdf',buffer:samplePdf()});
 await expect(page.locator('.file-detail small')).toContainText('2 صفحة');
 await page.locator('#convert').click();
 await expect(page.locator('#preview')).toHaveValue(/Hello from Waraqa/);
 const waiting=page.waitForEvent('download');await page.locator('#download').click();const download=await waiting;
 expect(download.suggestedFilename()).toBe('example.docx');
 const zip=unzipSync(await readFile(await download.path()));
 expect(strFromU8(zip['word/document.xml'])).toContain('Selected second page');
 await page.locator('#language').click();
 await expect(page.locator('html')).toHaveAttribute('dir','ltr');
 await page.locator('#text').click();
 await page.locator('#specific').check();
 await page.locator('#range').fill('3');await page.locator('#convert').click();
 await expect(page.locator('#error')).toContainText('Check your selection');
 await page.locator('#range').fill('2');await page.locator('#convert').click();
 await expect(page.locator('#preview')).toHaveValue('Selected second page');
 const textWaiting=page.waitForEvent('download');await page.locator('#download').click();const txt=await textWaiting;
 expect(txt.suggestedFilename()).toBe('example.txt');
 expect(await readFile(await txt.path(),'utf8')).toContain('Selected second page');
 expect(errors).toEqual([]);
});

test('mobile layout, file validation, reset, and language persistence',async({page})=>{
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.locator('#choose')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.screenshot({path:'test-results/mobile-arabic.png',fullPage:true});
 await page.locator('#file').setInputFiles({name:'fake.pdf',mimeType:'application/pdf',buffer:Buffer.from('not a PDF')});
 await expect(page.locator('#error')).toBeVisible();await expect(page.locator('#choose')).toBeVisible();
 await page.locator('#file').setInputFiles({name:'valid.pdf',mimeType:'application/pdf',buffer:samplePdf()});
 await expect(page.locator('#convert')).toBeEnabled();await page.locator('#remove').click();
 await expect(page.locator('#choose')).toBeVisible();
 await page.locator('#language').click();await page.reload();
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 expect(errors).toEqual([]);
});
