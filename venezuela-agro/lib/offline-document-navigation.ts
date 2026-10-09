import {isOfflineLibraryPath} from './offline-library-routes';
/** Same-document links belong to their own handler/browser (including Leaflet href="#"). */
export function shouldUseOfflineDocumentNavigation(current:URL,target:URL){
 if(target.origin!==current.origin)return false;
 if(target.pathname===current.pathname&&target.search===current.search)return false;
 return isOfflineLibraryPath(target.pathname)||['/app','/app-local','/finca-demo'].includes(target.pathname);
}
