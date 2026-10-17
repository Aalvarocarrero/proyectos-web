import {localOwner,verifySyncOwner} from './offline-owner';
/** Never keep using a previous signed-in account after an online account switch. */
export async function marketplaceOwner(){const owner=await localOwner();if(navigator.onLine&&!await verifySyncOwner(owner))throw new Error('account_changed_or_unverified');return owner;}
