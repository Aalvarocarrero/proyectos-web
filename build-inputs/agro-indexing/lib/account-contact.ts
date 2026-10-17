import {z} from 'zod';
export const accountContactSchema=z.object({
 publicContentAccepted:z.boolean(),securitySignalsAccepted:z.boolean(),
 phone:z.string().trim().regex(/^[+\d\s().-]{7,40}$/).refine(v=>{const n=v.replace(/\D/g,'').length;return n>=7&&n<=15;},'Introduce un celular válido.'),
 emailConfirmation:z.string().trim().email(),
});
export function confirmsAccountEmail(submitted:string,account:string){return submitted.trim().toLowerCase()===account.trim().toLowerCase();}
export function normalizeContactPhone(phone:string){return '+'+phone.replace(/\D/g,'');}
