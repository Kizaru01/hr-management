const fs=require('fs'),cp=require('child_process');
const changed=cp.execFileSync('git',['diff','--name-only','--','apps/web/src'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const added=['apps/web/src/lib/action-feedback.ts','apps/web/src/lib/api/safe-message.ts','apps/web/src/components/ui/sonner.tsx','apps/web/src/app/error.tsx','apps/web/src/features/employee-document/components/download-document-button.tsx'];
for(const p of changed){let s=fs.readFileSync(p,'utf8');if(s.includes('actionFeedback')&&s.includes('useValidationFocus')) s=s.replace(/success: ("[^"\n]+"),/g,'success: $1,\n        validation: true,');fs.writeFileSync(p,s);}
let p='apps/web/src/lib/action-feedback.ts',s=fs.readFileSync(p,'utf8').replace('partial?: string','partial?: string; validation?: boolean').replace('if (error instanceof ApiError && error.details', 'if (options.validation && error instanceof ApiError && error.details');fs.writeFileSync(p,s);
const prettier=require('./node_modules/.pnpm/prettier@3.9.6/node_modules/prettier');
(async()=>{for(const p of [...new Set([...changed,...added])]){const s=fs.readFileSync(p,'utf8');fs.writeFileSync(p,await prettier.format(s,{filepath:p}));}})();
