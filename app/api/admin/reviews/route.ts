import {desc,eq} from 'drizzle-orm';
import {z} from 'zod';
import {getDb} from '../../../../db';
import {reviews} from '../../../../db/schema';
import {isAdmin} from '../../../../lib/admin';
const headers={'Cache-Control':'no-store'};
export async function GET(request:Request){
 try{
  if(!await isAdmin(request))return Response.json({error:'Administrator access required.'},{status:403,headers});
  return Response.json(await getDb().select().from(reviews).orderBy(desc(reviews.createdAt),desc(reviews.id)),{headers});
 }catch{return Response.json({error:'Reviews could not be loaded.'},{status:503,headers});}
}
export async function PATCH(request:Request){
 try{
  if(!await isAdmin(request))return Response.json({error:'Administrator access required.'},{status:403,headers});
  const data=z.object({id:z.string().uuid(),status:z.enum(['pending','approved','rejected'])}).safeParse(await request.json().catch(()=>null));
  if(!data.success)return Response.json({error:'Choose a review and valid status.'},{status:400,headers});
  const db=getDb();
  await db.update(reviews).set({status:data.data.status}).where(eq(reviews.id,data.data.id));
  const [updated]=await db.select().from(reviews).where(eq(reviews.id,data.data.id));
  if(!updated)return Response.json({error:'This review no longer exists.'},{status:404,headers});
  return Response.json(updated,{headers});
 }catch{return Response.json({error:'The review could not be updated.'},{status:503,headers});}
}
export async function DELETE(request:Request){
 try{
  if(!await isAdmin(request))return Response.json({error:'Administrator access required.'},{status:403,headers});
  const data=z.object({id:z.string().uuid()}).safeParse(await request.json().catch(()=>null));
  if(!data.success)return Response.json({error:'Choose a valid review.'},{status:400,headers});
  const [result]=await getDb().delete(reviews).where(eq(reviews.id,data.data.id));
  if(!result.affectedRows)return Response.json({error:'This review no longer exists.'},{status:404,headers});
  return Response.json({ok:true},{headers});
 }catch{return Response.json({error:'The review could not be deleted.'},{status:503,headers});}
}
