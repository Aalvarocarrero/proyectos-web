import type {ProductDetails} from './marketplace-details';
import {MAP_PACK,NATIONAL_MAP_PACK} from './offline-map-pack';
import {packCoversBounds} from './offline-satellite-store';

/** Frame only the advertiser's actual coordinates, at the available map detail. */
export function declaredPointView(point?:ProductDetails['publicLocation']):{center:[number,number];zoom:number}{
 if(!point)return {center:[7,-66],zoom:5};
 const detail=packCoversBounds(MAP_PACK,[point.longitude,point.latitude,point.longitude,point.latitude]);
 return {center:[point.latitude,point.longitude],zoom:detail?MAP_PACK.maxZoom:NATIONAL_MAP_PACK.maxZoom};
}
