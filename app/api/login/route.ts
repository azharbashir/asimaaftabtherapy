import {isSameOrigin} from '../../../lib/request-origin';
import {sessionCookie} from '../../../lib/session-cookie';
import {getDb} from '../../../db';
import {users,sessions,loginAttempts} from '../../../db/schema';
import {eq,sql} from 'drizzle-orm';
import {DUMMY_PASSWORD_HASH,verifyPassword,tokenHash} from '../../../lib/password';
export async function POST(request:Request){
 if(!isSameOrigin(request))return Response.json({error:'Invalid request.'},{status:403});
 const data=await request.json().catch(()=>null) as {email?:unknown;password?:unknown}|null;
 if(typeof data?.email!=='string'||typeof data?.password!=='string'||data.email.length>254||data.password.length>256)return Response.json({error:'Enter your email and password.'},{status:400});
 const email=data.email.trim().toLowerCase(),db=getDb(),now=new Date().toISOString();
 const attempt=await db.insert(loginAttempts).values({email,count:'1',resetAt:new Date(Date.now()+900000).toISOString()}).onConflictDoUpdate({target:loginAttempts.email,set:{count:sql`CASE WHEN reset_at <= ${now} THEN '1' ELSE CAST(count AS INTEGER) + 1 END`,resetAt:sql`CASE WHEN reset_at <= ${now} THEN ${new Date(Date.now()+900000).toISOString()} ELSE reset_at END`}}).returning();
 if(Number(attempt[0].count)>10)return Response.json({error:'Too many attempts. Try again in 15 minutes.'},{status:429});
 const [user]=await db.select().from(users).where(eq(users.email,email));
 const valid=await verifyPassword(data.password,user?.passwordHash??DUMMY_PASSWORD_HASH);
 if(!user?.passwordHash||!valid)return Response.json({error:'Email or password is incorrect.'},{status:401});
 const token=crypto.randomUUID()+crypto.randomUUID();
 await db.insert(sessions).values({id:await tokenHash(token),userId:user.id,expiresAt:new Date(Date.now()+28800000).toISOString()});
 await db.delete(loginAttempts).where(eq(loginAttempts.email,email));
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store','Set-Cookie':sessionCookie(request,token,28800)}});
}
