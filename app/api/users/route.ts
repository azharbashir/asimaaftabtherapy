import {hashPassword} from '../../../lib/password';
import {getDb} from '../../../db';
import {users} from '../../../db/schema';
import {getAppUser,isAdmin} from '../../../lib/admin';
import {asc,eq} from 'drizzle-orm';
import {z} from 'zod';
const input=z.object({name:z.string().trim().min(1).max(120),email:z.string().trim().email().max(254).transform(v=>v.toLowerCase()),password:z.string().min(12).max(256),role:z.enum(['admin','manager','user'])});
export async function GET(request:Request){
 if(!await isAdmin(request))return Response.json({error:'Administrator access required.'},{status:403});
 return Response.json(await getDb().select({id:users.id,name:users.name,email:users.email,role:users.role,createdAt:users.createdAt}).from(users).orderBy(asc(users.name)),{headers:{'Cache-Control':'no-store'}});
}
export async function POST(request:Request){
 if(!await isAdmin(request))return Response.json({error:'Administrator access required.'},{status:403});
 try{
  const parsed=input.safeParse(await request.json());
  if(!parsed.success)return Response.json({error:'Enter a name, valid email, role and password of at least 12 characters.'},{status:400});
  const db=getDb();
  const [existing]=await db.select({id:users.id}).from(users).where(eq(users.email,parsed.data.email));
  if(existing)return Response.json({error:'A user with this email already exists.'},{status:409});
  const {password,...details}=parsed.data;
  const user={id:crypto.randomUUID(),...details,createdAt:new Date().toISOString()};
  try{await db.insert(users).values({...user,passwordHash:await hashPassword(password)});}catch(error){if((error as {cause?:{code?:string}}).cause?.code==='ER_DUP_ENTRY'||(error as {code?:string}).code==='ER_DUP_ENTRY')return Response.json({error:'A user with this email already exists.'},{status:409});throw error;}
  return Response.json(user,{status:201});
 }catch{return Response.json({error:'Could not add this user. Please try again.'},{status:400});}
}

export async function DELETE(request:Request){
 if(!await isAdmin(request))return Response.json({error:'Administrator access required.'},{status:403});
 const current=await getAppUser();
 const parsed=z.object({id:z.string().min(1).max(200)}).safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return Response.json({error:'Select a valid user.'},{status:400});
 if(parsed.data.id===current?.id)return Response.json({error:'You cannot remove your own account.'},{status:409});
 try{
  // Foreign-key cascade also revokes every session belonging to this account.
  const [removed]=await getDb().delete(users).where(eq(users.id,parsed.data.id));
  if(!removed.affectedRows)return Response.json({error:'This user no longer exists.'},{status:404});
  return Response.json({ok:true});
 }catch{return Response.json({error:'Could not remove this user. Please try again.'},{status:500});}
}

export async function PATCH(request:Request){
 if(!await isAdmin(request))return Response.json({error:'Administrator access required.'},{status:403});
 const parsed=z.object({id:z.string().min(1).max(200),role:z.enum(['admin','manager','user'])}).safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return Response.json({error:'Select a valid user and role.'},{status:400});
 const current=await getAppUser();
 if(parsed.data.id===current?.id)return Response.json({error:'You cannot change your own role.'},{status:409});
 try{
  const db=getDb();await db.update(users).set({role:parsed.data.role}).where(eq(users.id,parsed.data.id));
  const [updated]=await db.select({id:users.id,name:users.name,email:users.email,role:users.role,createdAt:users.createdAt}).from(users).where(eq(users.id,parsed.data.id));
  if(!updated)return Response.json({error:'This user no longer exists.'},{status:404});
  return Response.json(updated);
 }catch{return Response.json({error:'Could not update this role.'},{status:500});}
}
