import type {Metadata} from 'next';
import {getDb} from '../db';
import {content} from '../db/schema';
import {defaults,withDefaults} from './site-content';
/** Read saved copy on the server so search engines receive dashboard changes too. */
export async function siteMetadata(title:string,description?:string):Promise<Metadata>{
 let c=defaults;
 try{const rows=await getDb().select().from(content);if(rows.length)c=withDefaults(JSON.parse(rows[0].value));}catch{/* Keep the site available when storage is temporarily unavailable. */}
 return {title:c.copy[title]??title,...(description!==undefined?{description:c.copy[description]??description}:{})};
}
