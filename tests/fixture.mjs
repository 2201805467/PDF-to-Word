export function samplePdf() {
 const objects = [
 '<< /Type /Catalog /Pages 2 0 R >>',
 '<< /Type /Pages /Kids [3 0 R 6 0 R] /Count 2 >>',
 '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
 '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
 '',
 '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 7 0 R >>',
 ''
 ];
 for(const [index,text] of [[4,'Hello from Waraqa'],[6,'Selected second page']]) {
  const stream=`BT /F1 16 Tf 72 700 Td (${text}) Tj ET\n`;
  objects[index]=`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`;
 }
 let body='%PDF-1.4\n';const offsets=[0];
 objects.forEach((object,i)=>{offsets.push(Buffer.byteLength(body));body+=`${i+1} 0 obj\n${object}\nendobj\n`;});
 const xref=Buffer.byteLength(body);
 body+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
 body+=offsets.slice(1).map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('');
 body+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 return Buffer.from(body);
}
