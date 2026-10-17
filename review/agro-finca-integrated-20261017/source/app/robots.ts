import {SITE_ORIGIN} from "@/lib/site-identity";
import {PUBLIC_INDEXING_ENABLED,PRIVATE_PATHS} from "@/lib/indexing-policy";
import type {MetadataRoute} from "next";
export default function robots():MetadataRoute.Robots {
 return PUBLIC_INDEXING_ENABLED?{rules:[{userAgent:"*",allow:["/","/api/media/"],disallow:[...PRIVATE_PATHS,"/api/"]}],sitemap:SITE_ORIGIN+"/sitemap.xml"}:{rules:[{userAgent:"*",allow:"/"}]};
}
