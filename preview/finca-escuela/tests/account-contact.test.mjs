import assert from 'node:assert/strict';
import test,{after} from 'node:test';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const vite=await createServer({appType:'custom',configFile:false,root,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false,watch:null}});
after(()=>vite.close());
const {accountContactSchema,confirmsAccountEmail,normalizeContactPhone}=await vite.ssrLoadModule('/lib/account-contact.ts');
test('registration contact requires email and valid phone; matching a different account is refused',()=>{
 const p={publicContentAccepted:true,securitySignalsAccepted:false,phone:'+58 412 123 4567',emailConfirmation:'Usuario@ejemplo.com'};
 assert.equal(accountContactSchema.safeParse(p).success,true);
 for(const bad of [{...p,phone:''},{...p,phone:'123'},{...p,phone:'mi teléfono'},{...p,emailConfirmation:''},{...p,emailConfirmation:'invalid'}])assert.equal(accountContactSchema.safeParse(bad).success,false);
 assert.equal(confirmsAccountEmail(' Usuario@ejemplo.com ','usuario@ejemplo.com'),true);
 assert.equal(confirmsAccountEmail('otro@ejemplo.com','usuario@ejemplo.com'),false);
 assert.equal(normalizeContactPhone(p.phone),'+584121234567');
});
test('disabled biometric routes refuse credential registration and authentication',async()=>{
 for(const path of ['register/options','register/verify','authenticate/options','authenticate/verify']){
  const route=await vite.ssrLoadModule(`/app/api/security/passkey/${path}/route.ts`);
  assert.equal(route.GET().status,410);assert.equal(route.POST().status,410);
 }
});
