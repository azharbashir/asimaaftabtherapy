import {getDb} from '../../../db';
import {users} from '../../../db/schema';
import {isAdmin} from '../../../lib/admin';
import {asc,eq} from 'drizzle-orm';
import {z} from 'zod';
const input=z.object({name:z.string().trim().min(1).max(120),email:z.string().trim().email().max(254).transform(v=>v.toLowerCase()),role:z.enum(['admin','user'])});
export async function GET(request:Request){
 if(!await isAdmin(request))return Response.json({error:'Administrator access required.'},{status:403});
 return Response.json(await getDb().select({id:users.id,name:users.name,email:users.email,role:users.role,createdAt:users.createdAt}).from(users).orderBy(asc(users.name)),{headers:{'Cache-Control':'no-store'}});
}
export async function POST(request:Request){
 if(!await isAdmin(request))return Response.json({error:'Administrator access required.'},{status:403});
 try{
  const parsed=input.safeParse(await request.json());
  if(!parsed.success)return Response.json({error:'Enter a name, valid email and role.'},{status:400});
  const db=getDb();
  const [existing]=await db.select({id:users.id}).from(users).where(eq(users.email,parsed.data.email));
  if(existing)return Response.json({error:'A user with this email already exists.'},{status:409});
  const user={id:crypto.randomUUID(),...parsed.data,createdAt:new Date().toISOString()};
  const inserted=await db.insert(users).values(user).onConflictDoNothing({target:users.email}).returning({id:users.id});
  if(!inserted.length)return Response.json({error:'A user with this email already exists.'},{status:409});
  return Response.json(user,{status:201});
 }catch{return Response.json({error:'Could not add this user. Please try again.'},{status:400});}
}
