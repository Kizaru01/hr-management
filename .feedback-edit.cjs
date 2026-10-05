const fs=require('fs'),path=require('path');
const root='apps/web/src';
const read=p=>fs.readFileSync(p,'utf8'); const write=(p,s)=>fs.writeFileSync(p,s);
let p=root+'/lib/api/api.client.ts',s=read(p);
s=s.replace('import { toast } from "sonner";', 'import { safeMessage } from "./safe-message";').replace('  notify?: boolean;\n','');
let start=s.indexOf('  const {\n    fallbackMessage =');let end=s.indexOf('const safeJson',start);
s=s.slice(0,start)+`  const { fallbackMessage = "Something went wrong.", ...requestOptions } = options;
  let response: Response;
  try {
    response = await fetch(path, requestOptions);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError("Unable to reach the server. Check your connection and try again.", 0);
  }
  return parseApiResponse<T>(response, fallbackMessage);
};

`+s.slice(end);
s=s.replace('errorResponse?.error.message ?? fallbackMessage','response.status >= 500 ? fallbackMessage : safeMessage(errorResponse?.error.message, fallbackMessage)');
s=s.replace('errorResponse?.error.details,',`response.status < 500 && errorResponse?.error.details
        ? Object.fromEntries(Object.entries(errorResponse.error.details).map(([field, messages]) =>
            [field, (Array.isArray(messages) ? messages : []).map(message => safeMessage(message, "Invalid value."))],
          )) : undefined,`);
s=s.replace('  return data as T;',`  if (isErrorResponse(data)) throw new ApiError(fallbackMessage, response.status, data);
  return data as T;`);
write(p,s);
p=root+'/app/layout.tsx';write(p,read(p).replace('import { Toaster } from "sonner";','import { Toaster } from "@/components/ui/sonner";').replace('<Toaster closeButton richColors position="top-right" />','<Toaster />'));
const features=['employee','departments','positions','branch','employee-document','announcement','shift','leave','user','attendance','performance-review'];
const actions={createEmployee:'Employee created.',updateEmployee:'Employee updated.',assignManager:'Manager assigned.',terminateEmployee:'Employee terminated.',createDepartment:'Department created.',updateDepartment:'Department updated.',changeDepartmentStatus:'Department status updated.',createPosition:'Position created.',updatePosition:'Position updated.',changePositionStatus:'Position status updated.',createBranch:'Branch created.',updateBranch:'Branch updated.',changeBranchStatus:'Branch status updated.',uploadEmployeeDocument:'Document uploaded.',deactivateEmployeeDocument:'Document deactivated.',createAnnouncement:'Announcement published.',createShift:'Shift created.',updateShift:'Shift updated.',deactivateShift:'Shift deactivated.',assignShift:'Shift assigned.',removeShiftAssignment:'Shift assignment removed.',createLeave:'Leave request submitted.',approveLeave:'Leave request approved.',rejectLeave:'Leave request rejected.',cancelLeave:'Leave request cancelled.',createUser:'Account created.',updateUserRole:'User role updated.',activateUserAccess:'User access activated.',deactivateUserAccess:'User access deactivated.',resendUserInvitation:'Invitation sent.',checkIn:'Checked in.',checkOut:'Checked out.',createPerformanceReview:'Performance review created.'};
const loading={uploadEmployeeDocument:'Uploading document...',createUser:'Creating account and sending invitation...',resendUserInvitation:'Sending invitation...',createAnnouncement:'Publishing announcement...'};
for(const feature of features) for(const file of fs.readdirSync(root+'/features/'+feature+'/components')) {
 if(!file.endsWith('.tsx'))continue;
 p=root+'/features/'+feature+'/components/'+file;s=read(p);let changed=false;
 const re=/await (\w+)\(/g;const matches=[...s.matchAll(re)].reverse();
 for(const m of matches){const name=m[1];if(!actions[name])continue;const begin=m.index;const arg=begin+m[0].length;let depth=1,i=arg;let quote=null;
 for(;i<s.length;i++){const c=s[i];if(quote){if(c==='\\'){i++;continue;}if(c===quote)quote=null;continue;}if(c==='"'||c==="'"||c==='`'){quote=c;continue;}if(c==='(')depth++;if(c===')'&&--depth===0)break; if(c!==')') { /* depth handled above */ }}
 // Use a separate balanced scan (only parentheses affect call boundaries).
 depth=1;quote=null;i=arg;
 for(;i<s.length;i++){const c=s[i];if(quote){if(c==='\\'){i++;continue;}if(c===quote)quote=null;continue;}if(c==='"'||c==="'"||c==='`'){quote=c;continue;}if(c==='(')depth++;else if(c===')'){depth--;if(!depth)break;}}
 const expr=s.slice(begin+6,i+1);
 let error='Could not confirm the action. Please check the current record before trying again.';
 if(!['createPerformanceReview','createAnnouncement'].includes(name)) error='Unable to '+name.replace(/([A-Z])/g,' $1').toLowerCase()+'. Please try again.';
 s=s.slice(0,begin)+`await actionFeedback(() => ${expr}, ${JSON.stringify({success:actions[name],error,...(loading[name]?{loading:loading[name]}:{})})})`+s.slice(i+1);changed=true;
 }
 if(changed){s=s.replace('"use client";','"use client";\n\nimport { actionFeedback } from "@/lib/action-feedback";');
 // Existing inline errors remain actionable; transient success is now owned by the request toast.
 s=s.replace(/setFeedback\(\{ (?:type|tone): "success", message: response.message \}\);/g,'setFeedback(null);');
 // Forms focus only their own invalid fields after React commits error state.
 if(s.includes('const [fieldErrors, setFieldErrors]')&&s.includes('<form')){
 s=s.replace('import { actionFeedback }','import { actionFeedback, useValidationFocus }');
 s=s.replace(/(const \[fieldErrors, setFieldErrors\][\s\S]*?;)/, '$1\n  const validationFormRef = useValidationFocus(fieldErrors);');
 s=s.replace('<form','<form ref={validationFormRef}');
 }
 write(p,s);}
 // Parent success banners duplicate child-owned toasts; preserve callbacks that close sheets.
 if(/(?:department|position|branch|shift)-management\.tsx/.test(file)||file==='managed-leave-requests.tsx'){
 s=read(p).replace('setFeedback({ type: "success", message });','setFeedback(null);').replace(/const (handleMutationSuccess|handleRejectSuccess) = \(message: string\)/g,'const $1 = ()');write(p,s);
 }
}
