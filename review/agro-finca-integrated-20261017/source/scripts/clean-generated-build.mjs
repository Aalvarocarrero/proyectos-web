import {rm} from 'node:fs/promises';
// Clear only generated output so successive releases do not accumulate obsolete chunks.
await rm(new URL('../dist',import.meta.url),{recursive:true,force:true});
