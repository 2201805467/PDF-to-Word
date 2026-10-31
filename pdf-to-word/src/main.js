import './style.css';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { parsePages, textLines, makeWord } from './document.js';

GlobalWorkerOptions.workerSrc = workerUrl;
const icons = {
 file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
 upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4"/>',
 shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/>',
 arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
 check: '<path d="m5 12 4 4L19 6"/>',
 text: '<path d="M4 5h16M12 5v15M8 20h8"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const copy = {
 ar: {
 brand:'ورقة', sub:'مساحة أبسط لمستنداتك', language:'English', nav:'أداة صغيرة، فرق كبير', badge:'بلا حساب. بلا رفع إلى خادم.', heading:'من ملف ثابت،<br>إلى أفكار <em>قابلة للتعديل.</em>', intro:'حوّل PDF إلى Word أو استخرج نصوصه. مباشرة من متصفحك، وبخصوصية كاملة لملفاتك.', word:'PDF إلى Word', text:'استخراج النص', upload:'أفلت ملف PDF هنا', browse:'أو اختر ملفًا من جهازك', limit:'ملف واحد · حتى 25 MB · PDF فقط', choose:'اختر ملف PDF', file:'المستند', change:'تغيير الملف', pages:'الصفحات', all:'جميع الصفحات', selected:'صفحات محددة', range:'مثال: 1-3, 5', rangeHelp:'اكتب أرقام الصفحات أو نطاقًا، مفصولة بفاصلة.', convert:'تحويل إلى Word', extract:'استخراج النص', local:'ملفك يبقى على جهازك', localSub:'تُعالج الملفات داخل المتصفح ولا تُرسل إلى خوادمنا.', feature1:'جاهز للتعديل', feature1sub:'نصوص قابلة للتحرير داخل ملف Word.', feature2:'العربية والإنجليزية', feature2sub:'مع دعم اتجاه النص من اليمين إلى اليسار.', feature3:'دون خطوات إضافية', feature3sub:'اختر ملفك، عالجه، وحمّل النتيجة.', note:'تعمل هذه النسخة مع ملفات PDF النصية. الملفات المصوّرة تحتاج OCR غير متاح حاليًا. قد تختلف الجداول والأعمدة والصور عن الأصل.', footer:'صُنع ليجعل العمل أخف.', privacy:'خصوصيتك أولًا، دائمًا.', loading:'جارٍ قراءة المستند…', working:'جارٍ معالجة الصفحة', done:'مستندك جاهز', doneSub:'يمكنك تنزيل النتيجة أو مراجعة النص المستخرج.', download:'تنزيل Word', downloadText:'تنزيل النص', copy:'نسخ النص', copied:'تم النسخ', preview:'النص المستخرج', reset:'معالجة ملف آخر', badFile:'اختر ملف PDF صالحًا لا يتجاوز 25 MB.', invalid:'تعذّر قراءة الملف. قد يكون تالفًا أو محميًا بكلمة مرور.', rangeError:'تحقق من الصفحات: استخدم مثلًا 1-3, 5 ضمن عدد صفحات الملف.', empty:'لم نعثر على نص قابل للاستخراج. قد يكون الملف مصوّرًا ويحتاج إلى OCR.', error:'تعذّرت المعالجة. جرّب ملفًا آخر.', copyError:'تعذّر النسخ. يمكنك تحديد النص ونسخه يدويًا.', blank:'بعض الصفحات لا تحتوي على نص قابل للاستخراج.', count:'صفحة', step:'01 / أضف مستندك', ready:'02 / النتيجة', busy:'جارٍ التحضير…', remove:'إزالة الملف', how:'كيف تعمل؟', howText:'١. اختر ملف PDF نصيًا. ٢. حدد الأداة والصفحات. ٣. نزّل Word أو النص. المعالجة محلية بالكامل؛ لا يلزم تسجيل دخول.'
 },
 en: {
 brand:'Waraqa', sub:'A little space for your documents', language:'العربية', nav:'Small tool. Big possibilities.', badge:'No account. No server uploads.', heading:'From a static file,<br>to ideas <em>you can edit.</em>', intro:'Turn your PDF into Word or extract its text. Right in your browser, with your files kept private.', word:'PDF to Word', text:'Extract text', upload:'Drop your PDF here', browse:'or choose a file from your device', limit:'One file · Up to 25 MB · PDF only', choose:'Choose PDF file', file:'DOCUMENT', change:'Change file', pages:'Pages', all:'All pages', selected:'Specific pages', range:'e.g. 1-3, 5', rangeHelp:'Separate page numbers or ranges with commas.', convert:'Convert to Word', extract:'Extract text', local:'Your file stays on your device', localSub:'Files are processed in your browser and never sent to our servers.', feature1:'Ready to edit', feature1sub:'Editable text in a downloadable Word document.', feature2:'Arabic & English', feature2sub:'Including support for right-to-left text.', feature3:'No extra steps', feature3sub:'Choose your file, process it, download the result.', note:'This version works with text-based PDFs. Scans need OCR, which is not available yet. Tables, columns and images may differ from the original.', footer:'Made to make work feel lighter.', privacy:'Your privacy comes first. Always.', loading:'Reading your document…', working:'Processing page', done:'Your document is ready', doneSub:'Download the result or review your extracted text.', download:'Download Word', downloadText:'Download text', copy:'Copy text', copied:'Copied', preview:'Extracted text', reset:'Process another file', badFile:'Choose a valid PDF up to 25 MB.', invalid:'Unable to read this file. It may be damaged or password protected.', rangeError:'Check your selection: use 1-3, 5 within the document’s page count.', empty:'No extractable text found. This may be a scan requiring OCR.', error:'Processing failed. Please try another file.', copyError:'Copy failed. Select and copy the text manually.', blank:'Some pages have no extractable text.', count:'pages', step:'01 / ADD YOUR DOCUMENT', ready:'02 / YOUR RESULT', busy:'Preparing…', remove:'Remove file', how:'How it works', howText:'1. Choose a text-based PDF. 2. Select a tool and pages. 3. Download Word or text. Everything runs locally; no account needed.'
 }
};
let lang = localStorage.getItem('waraqa-language') === 'en' ? 'en' : 'ar';
let mode = 'word', pdf = null, pdfTask = null, file = null, busy = false, result = null, error = '', progress = 0, stage = '', specific = false, range = '', generation = 0;
const $ = selector => document.querySelector(selector);
const t = () => copy[lang];
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render() {
 const c=t(); document.documentElement.lang=lang; document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 $('#app').innerHTML = `
 <header class="header"><a class="brand" href="/"> <span class="brand-mark">${icon('file')}</span><span>${c.brand}<small>${c.sub}</small></span></a><nav><span>${c.nav}</span><button id="language" class="language">◎ &nbsp;${c.language}</button></nav></header>
 <main><section class="hero"><div class="eyebrow"><span></span>${c.badge}</div><h1>${c.heading}</h1><p>${c.intro}</p></section>
 <section class="workspace" aria-label="${c.word}"><div class="tabs" role="tablist"><button id="word" role="tab" aria-selected="${mode==='word'}" class="${mode==='word'?'active':''}" ${busy?'disabled':''}>${icon('file')}${c.word}</button><button id="text" role="tab" aria-selected="${mode==='text'}" class="${mode==='text'?'active':''}" ${busy?'disabled':''}>${icon('text')}${c.text}</button></div>
 <div class="workspace-body"><div class="section-label"><span>${result?c.ready:c.step}</span><span class="format">${mode==='word'?'PDF → DOCX':'PDF → TXT'}</span></div>
 ${!result ? `<input id="file" type="file" accept="application/pdf,.pdf" hidden ${busy?'disabled':''}>
 ${!file ? `<div class="dropzone" id="dropzone"><div class="upload-graphic"><span class="paper-back"></span><span class="paper-front">${icon('file')}<b>PDF</b></span><span class="upload-dot">${icon('upload')}</span></div><h2>${c.upload}</h2><p>${c.browse}</p><button class="primary choose" id="choose">${icon('upload')}${c.choose}</button><small>${c.limit}</small></div>` : `<div class="file-card"><span class="file-icon">${icon('file')}</span><div class="file-detail"><strong dir="auto">${escape(file.name)}</strong><small>${(file.size/1048576).toFixed(2)} MB ${pdf?' · '+pdf.numPages+' '+c.count:''}</small></div><button id="remove" class="quiet" aria-label="${c.remove}" ${busy?'disabled':''}>×</button></div>
 ${pdf ? `<div class="settings"><label>${c.pages}</label><div class="radio-row"><label><input type="radio" name="pages" id="all" ${!specific?'checked':''} ${busy?'disabled':''}>${c.all}</label><label><input type="radio" name="pages" id="specific" ${specific?'checked':''} ${busy?'disabled':''}>${c.selected}</label></div>${specific?`<input id="range" class="range-input" dir="ltr" value="${escape(range)}" placeholder="${c.range}" aria-label="${c.selected}" ${busy?'disabled':''}><small>${c.rangeHelp}</small>`:''}</div>`:''}
 <button class="primary convert" id="convert" ${!pdf||busy?'disabled':''}>${busy?c.busy:(mode==='word'?c.convert:c.extract)} ${icon('arrow')}</button>`}
 ${busy?`<div class="progress" role="status"><div><span>${stage==='loading'?c.loading:c.working}</span><b>${progress}%</b></div><progress max="100" value="${progress}">${progress}%</progress></div>`:''}`:
 `<div class="success-mark">${icon('check')}</div><h2 class="result-title">${c.done}</h2><p class="result-sub">${c.doneSub}</p><div class="result-actions"><button id="download" class="primary">${icon('file')}${mode==='word'?c.download:c.downloadText}</button><button id="copy" class="secondary">${c.copy}</button></div>${result.blank?`<p class="warning">${c.blank}</p>`:''}<label class="preview-label" for="preview">${c.preview}</label><textarea id="preview" dir="auto" readonly>${escape(result.text)}</textarea><button id="reset" class="reset">${c.reset} ↗</button>`}
 <p id="error" class="error" role="alert" ${!error?'hidden':''}>${escape(error)}</p>
 <div class="privacy-strip">${icon('shield')}<div><strong>${c.local}</strong><p>${c.localSub}</p></div><span class="privacy-dot"></span></div></div></section>
 <section class="features">${[['file',c.feature1,c.feature1sub],['text',c.feature2,c.feature2sub],['check',c.feature3,c.feature3sub]].map(([i,title,sub],n)=>`<article><span class="feature-number">0${n+1}</span><div class="feature-icon">${icon(i)}</div><h3>${title}</h3><p>${sub}</p></article>`).join('')}</section><p class="fine-print">${c.note}</p><details class="how"><summary>${c.how}</summary><p>${c.howText}</p></details></main><footer><span>© ${new Date().getFullYear()} ${c.brand} · ${c.footer}</span><span>${icon('shield')}${c.privacy}</span></footer>`;
 $('#language').onclick=()=>{lang=lang==='ar'?'en':'ar';localStorage.setItem('waraqa-language',lang);error='';render();};
 for(const m of ['word','text']) $('#'+m).onclick=()=>{if(busy)return; mode=m; result=null; error='';render();};
 if($('#file')) $('#file').onchange=e=>load(e.target.files[0]);
 if($('#choose')) $('#choose').onclick=()=>$('#file').click();
 if($('#dropzone')) {const drop=$('#dropzone'); drop.ondragover=e=>{e.preventDefault();drop.classList.add('dragover');};drop.ondragleave=()=>drop.classList.remove('dragover');drop.ondrop=e=>{e.preventDefault();load(e.dataTransfer.files[0]);};}
 if($('#remove')) $('#remove').onclick=reset;
 if($('#all')) $('#all').onchange=()=>{specific=false;render();};
 if($('#specific')) $('#specific').onchange=()=>{specific=true;render();$('#range').focus();};
 if($('#range')) $('#range').oninput=e=>range=e.target.value;
 if($('#convert')) $('#convert').onclick=process;
 if($('#reset')) $('#reset').onclick=reset;
 if($('#download')) $('#download').onclick=()=>download(result.blob,file.name.replace(/\.pdf$/i,'')+(mode==='word'?'.docx':'.txt'));
 if($('#copy')) $('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(result.text);$('#copy').textContent=t().copied;}catch{error=t().copyError;render();}};
}
async function reset() {generation++;const oldTask=pdfTask;pdfTask=null;pdf=null;file=null;result=null;error='';specific=false;range='';busy=false;render();if(oldTask)await oldTask.destroy();}
async function load(candidate) {
 if(!candidate||busy)return;
 if(!/\.pdf$/i.test(candidate.name)||candidate.size>25*1048576||candidate.size===0){error=t().badFile;render();return;}
 const current=++generation;const oldTask=pdfTask;pdfTask=null;pdf=null;file=candidate;result=null;error='';busy=true;stage='loading';progress=0;specific=false;range='';render();
 try {if(oldTask)await oldTask.destroy();const data=new Uint8Array(await candidate.arrayBuffer());const task=getDocument({data,isEvalSupported:false,cMapUrl:'/cmaps/',cMapPacked:true,standardFontDataUrl:'/standard_fonts/'});pdfTask=task;task.onPassword=()=>task.destroy();const loaded=await task.promise;if(current!==generation){await task.destroy();return;}pdf=loaded;}
 catch {if(current===generation){file=null;error=t().invalid;}}
 finally {if(current===generation){busy=false;render();}}
}
async function process() {
 if(!pdf||busy)return;
 let numbers;try{if(specific&&!range.trim())throw new Error('range');numbers=parsePages(specific?range:'',pdf.numPages);}catch{error=t().rangeError;render();return;}
 busy=true;error='';progress=0;stage='processing';render();
 try {
 const pages=[];
 for(let i=0;i<numbers.length;i++) {const page=await pdf.getPage(numbers[i]);const content=await page.getTextContent();pages.push({number:numbers[i],lines:textLines(content.items)});page.cleanup();progress=Math.round((i+1)/numbers.length*90);render();await new Promise(resolve=>setTimeout(resolve,0));}
 const text=pages.map(p=>p.lines.join('\n')).join('\n\n');
 if(!text.trim())throw new Error('empty');
 const blob=mode==='word'?await makeWord(pages):new Blob(['\ufeff',text],{type:'text/plain;charset=utf-8'});
 result={text,blob,blank:pages.some(p=>!p.lines.length)};progress=100;
 }catch(e){error=e.message==='empty'?t().empty:t().error;}finally{busy=false;render();}
}
function download(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
render();
