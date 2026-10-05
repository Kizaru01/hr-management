const fs=require('fs'); const root='apps/web/src';const read=p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n'); const write=(p,s)=>fs.writeFileSync(p,s);
let p=root+'/lib/api/api.client.ts',s=read(p);let a=s.indexOf('export const apiClient');let b=s.indexOf('const safeJson',a);let c=s.indexOf('const isErrorResponse',b);let d=s.indexOf(';',c)+1;
s=s.slice(0,a)+`export const apiClient = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { fallbackMessage = "Something went wrong.", ...requestOptions } = options;
  let response: Response;
  try {
    response = await fetch(path, requestOptions);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError("Unable to reach the server. Check your connection and try again.", 0);
  }
  return parseApiResponse<T>(response, fallbackMessage);
};

`+s.slice(b,d)+'\n'; s=s.replace('  notify?: boolean;\n','');write(p,s);
// Preserve response envelopes previously discarded by employee helpers.
for(const file of ['assign-manager','terminate-employee','update-employee']){p=root+'/features/employee/api/'+file+'.ts';s=read(p).replace('): Promise<void> => {',') => {').replace('  await apiClient(', '  return apiClient(');write(p,s);}
for(const [file,guard,label] of [['assign-manager-dialog','!managerId','Saving...'],['terminate-dialog','!terminationDate || !reason.trim()','Terminating...']]){
p=root+'/features/employee/components/'+file+'.tsx';s=read(p);s=s.replace('import { actionFeedback }','import { actionFeedback, useValidationFocus }').replace('import { useState }','import { useState }');s=s.replace('import { useRouter }','import { ApiError } from "@/lib/api/api.client";\nimport { useRouter }');
s=s.replace('  const [open, setOpen]', '  const [isSubmitting, setIsSubmitting] = useState(false);\n  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});\n  const validationFormRef = useValidationFocus(fieldErrors);\n  const [open, setOpen]');
s=s.replace(`if (${guard}) return;`, `if (isSubmitting || ${guard}) return;\n    setIsSubmitting(true);\n    setFieldErrors({});\n    try {`);
s=s.replace('    router.refresh();','    router.refresh();\n    } catch (error) {\n      if (error instanceof ApiError) setFieldErrors(error.details ?? {});\n    } finally {\n      setIsSubmitting(false);\n    }');
s=s.replace('onRequestClose={() => setOpen(false)}','onRequestClose={() => { if (!isSubmitting) setOpen(false); }}');
s=s.replace('<div className="space-y-4">','<form ref={validationFormRef} className="space-y-4" onSubmit={(event) => { event.preventDefault(); }}>').replace('          </div>\n        </Dialog>','          </form>\n        </Dialog>');
s=s.replace(`disabled={${guard}}`,`disabled={isSubmitting || ${guard}}`);
s=s.replace('                Save\n','                {isSubmitting ? "Saving..." : "Save"}\n').replace('                Confirm termination\n','                {isSubmitting ? "Terminating..." : "Confirm termination"}\n');
s=s.replace('onClick={() => setOpen(false)}','disabled={isSubmitting}\n                onClick={() => setOpen(false)}');
for(const [tag,name] of file==='assign-manager-dialog'?[['Select','managerId']]:[['Input','terminationDate'],['Textarea','reason']]){
s=s.replace('<'+tag+'\n','<'+tag+'\n                name="'+name+'"\n                disabled={isSubmitting}\n                aria-invalid={Boolean(fieldErrors.'+name+')}\n');
const marker=tag==='Select'?'</Select>':name==='terminationDate'?'data-dialog-initial-focus\n              />':'placeholder="Termination reason"\n              />';
s=s.replace(marker,marker+'\n              {fieldErrors.'+name+'?.[0] ? <p className="text-sm text-destructive">{fieldErrors.'+name+'[0]}</p> : null}');}
write(p,s);
}
p=root+'/features/employee/components/employee-edit-form.tsx';s=read(p).replace('    event.preventDefault();','    event.preventDefault();\n    if (isSaving) return;');write(p,s);
p=root+'/features/shift/components/employee-shift-history.tsx';s=read(p).replace('import { ApiError } from "@/lib/api/api.client";\n','').replace(/    } catch \(error\) \{[\s\S]*?    } finally \{/, '    } catch {\n      // The action toast reports request failure; keep the schedule unchanged.\n    } finally {');write(p,s);
p=root+'/features/user/components/create-user-form.tsx';s=read(p).replace('type: response.data.invitationSent ? "success" : "error",','type: "error",').replace('      setFeedback({\n        type: "error",\n        message: response.message,\n      });','      setFeedback(response.data.invitationSent ? null : {\n        type: "error",\n        message: "Account created, but the invitation was not sent. Use Resend invitation from the user list.",\n      });');write(p,s);
