import {getDb} from '../../../db';
import {content} from '../../../db/schema';
import {defaults} from '../../../lib/site-content';
import {isAdmin} from '../../../lib/admin';
import {z} from 'zod';
const text=z.string().max(12000);
const schema=z.object({name:z.string().min(1).max(120),headline:text,intro:text,about:text,email:z.union([z.literal(''),z.string().email()]),phone:z.string().max(100),credentials:text,fee:text,services:z.array(z.object({title:text,text,icon:text})).max(30),articles:z.array(z.object({title:text,category:text,body:text})).max(50),faqs:z.array(z.object({q:text,a:text})).max(40)});
export async function GET(){try{const rows=await getDb().select().from(content);return Response.json(rows.length?JSON.parse(rows[0].value):defaults);}catch{return Response.json({error:'Content could not be loaded.'},{status:503});}}
export async function PUT(request:Request){if(!await isAdmin(request))return Response.json({error:'Administrator sign-in required.'},{status:403});try{const parsed=schema.safeParse(await request.json());if(!parsed.success)return Response.json({error:'Invalid website content.'},{status:400});const value=JSON.stringify(parsed.data);if(value.length>200000)return Response.json({error:'Website content is too large.'},{status:400});await getDb().insert(content).values({id:'site',value}).onConflictDoUpdate({target:content.id,set:{value}});return Response.json({ok:true});}catch{return Response.json({error:'Could not save changes.'},{status:500});}}
