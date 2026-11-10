import {and,asc,avg,count,desc,eq,sql} from 'drizzle-orm';
import {z} from 'zod';
import {getDb} from '../../../db';
import {content,reviews} from '../../../db/schema';
import {defaults,withDefaults} from '../../../lib/site-content';
import {isSameOrigin} from '../../../lib/request-origin';
const headers={'Cache-Control':'no-store'};
const input=z.object({service:z.string().trim().min(1).max(200),rating:z.number().int().min(1).max(5),displayName:z.string().trim().max(80).optional().default(''),body:z.string().trim().min(10).max(1000),consent:z.literal(true),website:z.string().max(0).optional()});
export async function GET(request:Request){
 try{
  const params=new URL(request.url).searchParams;
  const parsed=z.object({service:z.string().max(200).default(''),rating:z.coerce.number().int().min(0).max(5).default(0),page:z.coerce.number().int().min(1).max(100000).default(1),sort:z.enum(['recent','highest','lowest']).default('recent')}).safeParse(Object.fromEntries(params));
  if(!parsed.success)return Response.json({error:'Please check the review filters.'},{status:400,headers});
  const {service,rating,sort}=parsed.data,db=getDb(),pageSize=6;
  const base=and(eq(reviews.status,'approved'),service?eq(reviews.service,service):undefined);
  const filtered=and(base,rating?eq(reviews.rating,rating):undefined);
  const [[totals],[stats],services]=await Promise.all([
   db.select({total:count()}).from(reviews).where(filtered),
   db.select({total:count(),average:avg(reviews.rating),one:sql<number>`COALESCE(SUM(${reviews.rating}=1),0)`,two:sql<number>`COALESCE(SUM(${reviews.rating}=2),0)`,three:sql<number>`COALESCE(SUM(${reviews.rating}=3),0)`,four:sql<number>`COALESCE(SUM(${reviews.rating}=4),0)`,five:sql<number>`COALESCE(SUM(${reviews.rating}=5),0)`}).from(reviews).where(base),
   db.selectDistinct({service:reviews.service}).from(reviews).where(eq(reviews.status,'approved')).orderBy(asc(reviews.service)),
  ]);
  const total=Number(totals.total),page=Math.min(parsed.data.page,Math.max(1,Math.ceil(total/pageSize)));
  const order=sort==='highest'?[desc(reviews.rating),desc(reviews.createdAt),desc(reviews.id)]:sort==='lowest'?[asc(reviews.rating),desc(reviews.createdAt),desc(reviews.id)]:[desc(reviews.createdAt),desc(reviews.id)];
  const rows=await db.select({id:reviews.id,service:reviews.service,rating:reviews.rating,displayName:reviews.displayName,body:reviews.body,createdAt:reviews.createdAt}).from(reviews).where(filtered).orderBy(...order).limit(pageSize).offset((page-1)*pageSize);
  return Response.json({reviews:rows,total,page,pageSize,services:services.map(s=>s.service),summary:{total:Number(stats.total),average:Number(stats.average||0),distribution:[stats.one,stats.two,stats.three,stats.four,stats.five].map(Number)}},{headers});
 }catch{return Response.json({error:'Reviews could not be loaded. Please try again.'},{status:503,headers});}
}
export async function POST(request:Request){
 try{
  if(!isSameOrigin(request))return Response.json({error:'Invalid request origin.'},{status:403,headers});
  const raw=await request.text();
  if(raw.length>8000)return Response.json({error:'Your review is too long.'},{status:413,headers});
  const data=input.safeParse(JSON.parse(raw));
  if(!data.success)return Response.json({error:'Choose a service and rating, enter 10–1,000 characters, and agree to publication.'},{status:400,headers});
  const db=getDb(),[saved]=await db.select().from(content).where(eq(content.id,'site'));
  const site=saved?withDefaults(JSON.parse(saved.value)):defaults;
  if(!site.services.some(s=>s.title===data.data.service))return Response.json({error:'Please choose a current service.'},{status:400,headers});
  const {service,rating,body,displayName}=data.data;
  await db.insert(reviews).values({id:crypto.randomUUID(),service,rating,body,displayName:displayName||'Anonymous',status:'pending',createdAt:new Date().toISOString()});
  return Response.json({ok:true,message:'Thank you. Your review has been sent for approval and is not public yet.'},{status:201,headers});
 }catch(error){
  if(error instanceof SyntaxError)return Response.json({error:'Please check your review and try again.'},{status:400,headers});
  return Response.json({error:'Your review could not be saved. Please try again.'},{status:503,headers});
 }
}
