import {logServerError} from '../../../lib/server-error';
import {getDb} from '../../../db';
import {content,images} from '../../../db/schema';
import {and,lt,notInArray} from 'drizzle-orm';
import {defaults,withDefaults} from '../../../lib/site-content';
import {isAdmin} from '../../../lib/admin';
import {z} from 'zod';
const text=z.string().max(12000);
const short=z.string().max(200);
const url=z.union([z.literal(''),z.string().max(2000).url().refine(v=>v.startsWith('https://'),'Use an https:// link')]);
// Either an uploaded image (/api/images/<id>) or an external https:// link.
const image=z.union([url,z.string().regex(/^\/api\/images\/[0-9a-f-]{36}$/)]);
const schema=z.object({
 copy:z.record(z.string().max(200),text).default({}),
 logoImage:image.default(''),brandTagline:short.default(''),
 name:z.string().min(1).max(120),tagline:short,email:z.union([z.literal(''),z.string().email()]),credentials:text,fee:text,
 phones:z.array(z.object({label:short,number:z.string().trim().min(3).max(40).regex(/^[+\d\s()-]+$/,'Phone numbers may contain digits, spaces, +, ( ) and - only'),whatsapp:z.boolean()})).max(6),
 socials:z.object({facebook:url,instagram:url,linkedin:url}),
 heroBadge:short,headline:text,intro:text,heroImage:image,
 about:text,aboutClosing:text,aboutImage:image,
 stats:z.array(z.object({value:short,label:short})).max(8),
 bookingIntro:text,quote:text,quoteAuthor:short,
 sessions:z.array(z.object({title:short,subtitle:short,price:short,features:text})).min(1).max(4),
 onlineIntro:text,onlineItems:z.array(z.object({title:short,text})).max(10),
 footerText:text,
 services:z.array(z.object({title:text,text,icon:text,image:image.default(''),badge:short.default('Online therapy'),duration:short.default(''),price:short.default('')})).max(30),
 articles:z.array(z.object({title:text,category:text,body:text,image,date:z.union([z.literal(''),z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])})).max(50),
 faqs:z.array(z.object({q:text,a:text})).max(40),
 testimonials:z.array(z.object({quote:text,name:short,location:short})).max(30)});
/** Delete uploads no longer referenced by the content. A one-day grace period protects images uploaded but not yet saved. */
async function removeUnusedImages(value:string){
 try{
  const used=[...value.matchAll(/\/api\/images\/([0-9a-f-]{36})/g)].map(m=>m[1]);
  const cutoff=new Date(Date.now()-86_400_000).toISOString();
  await getDb().delete(images).where(used.length?and(lt(images.createdAt,cutoff),notInArray(images.id,used)):lt(images.createdAt,cutoff));
 }catch{/* cleanup is best-effort */}
}
export async function GET(){
 const headers={'Cache-Control':'no-store'};
 try{const rows=await getDb().select().from(content);return Response.json(rows.length?withDefaults(JSON.parse(rows[0].value)):defaults,{headers});}
 catch(error){const reference=logServerError('content',error);return Response.json({error:'Content could not be loaded.',reference},{status:503,headers});}
}
export async function PUT(request:Request){if(!await isAdmin(request))return Response.json({error:'Administrator sign-in required.'},{status:403});try{const parsed=schema.safeParse(await request.json());if(!parsed.success){const i=parsed.error.issues[0];return Response.json({error:`Please check “${i.path.join(' › ')}”: ${i.message}`},{status:400});}const value=JSON.stringify(parsed.data);if(value.length>200000)return Response.json({error:'Website content is too large.'},{status:400});await getDb().insert(content).values({id:'site',value}).onDuplicateKeyUpdate({set:{value}});await removeUnusedImages(value);return Response.json({ok:true});}catch{return Response.json({error:'Could not save changes.'},{status:500});}}
