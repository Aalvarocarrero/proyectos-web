import type {Metadata} from 'next';
import {OfflineLibrary} from '@/components/offline-library';
export const metadata:Metadata={title:'Biblioteca descargada · Venezuela Agro',robots:{index:false,follow:false}};
/** Deliberately neutral: no authentication/session access or embedded private user data. */
export default function Page(){return <OfflineLibrary/>;}
