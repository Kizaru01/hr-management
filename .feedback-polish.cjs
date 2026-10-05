const fs=require('fs'),path=require('path');const root='apps/web/src';const read=p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');const write=(p,s)=>fs.writeFileSync(p,s);
function walk(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);}
for(const p of walk(root+'/features').filter(p=>p.endsWith('.tsx'))){let s=read(p);if(!s.includes('actionFeedback'))continue;
 if(!s.includes('response.')) s=s.replace(/const response =\s*/g,'');
 if(p.endsWith('user-list.tsx'))s=s.replace('const response =\n        action', 'action');
 // Keep all ordinary requests untouched. For mutations only, isolate any post-save UI failure.
 let pos=0,count=0;
 while((pos=s.indexOf('try {',pos))!==-1){const catchPos=s.indexOf('} catch',pos);if(catchPos<0)break;const body=s.slice(pos,catchPos);if(!body.includes('await actionFeedback')){pos=catchPos+7;continue;}
 const id='mutationConfirmed'+(count++||'');
 const marker=body.lastIndexOf('await actionFeedback');const semicolon=body.indexOf(';',marker);if(semicolon<0){pos=catchPos+7;continue;}
 const inner=body.slice(0,semicolon+1)+'\n      '+id+' = true;'+body.slice(semicolon+1);
 const tail=s.slice(catchPos);const brace=tail.indexOf('{');
 s=s.slice(0,pos)+'let '+id+' = false;\n    '+inner+tail.slice(0,brace+1)+'\n      if ('+id+') return;'+tail.slice(brace+1);
 pos=pos+inner.length+100;
 }
 // Format generated feedback options as normal multiline code.
 s=s.replace(/, (\{"success":[^\n]+?\})\)/g,(_,json)=>{try{return ', {\n'+Object.entries(JSON.parse(json)).map(([k,v])=>'        '+k+': '+JSON.stringify(v)+',').join('\n')+'\n      })';}catch{return ', '+json+')';}});
 write(p,s);
}
let p=root+'/lib/api/api.client.ts',s=read(p);s=s.replace('  return parseApiResponse<T>(response, fallbackMessage);',`  const data = await parseApiResponse<T>(response, fallbackMessage);
  if ((requestOptions.method ?? "GET").toUpperCase() !== "GET" && response.status !== 204 &&
      (typeof data !== "object" || data === null || !("success" in data) || data.success !== true)) {
    throw new ApiError("Could not confirm the result. Check the record before trying again.", 502);
  }
  return data;`);write(p,s);
p=root+'/features/employee/components/create-employee-form.tsx';s=read(p).replace('success: "Employee created.",','success: "Employee created.",\n        loading: "Creating employee and sending invitation...",\n        partial: "Employee created, but the invitation was not sent. Use Resend invitation.",');write(p,s);
for(const feature of ['announcement','performance-review']){p=root+'/features/'+feature+'/components/create-'+feature+'-form.tsx';s=read(p).replace('error instanceof ApiError\n            ? error.message','error instanceof ApiError && error.status < 500\n            ? error.message').replace('error instanceof ApiError\n              ? error.message','error instanceof ApiError && error.status < 500\n              ? error.message').replace(/"Unable to create (announcement|performance review)\."/g,'"Could not confirm the result. Check the list before trying again; the record may have been saved."');write(p,s);}
