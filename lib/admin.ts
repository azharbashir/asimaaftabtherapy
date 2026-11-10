import {isSameOrigin} from './request-origin';
import {getDb} from '../db';
import {cookies} from 'next/headers';
import {tokenHash} from './password';
import {sessions,users} from '../db/schema';
import {eq} from 'drizzle-orm';

export async function getAppUser(){
 const token=(await cookies()).get('practice_session')?.value;
 if(token){
  const db=getDb();
  const [session]=await db.select().from(sessions).where(eq(sessions.id,await tokenHash(token)));
  if(session&&session.expiresAt>new Date().toISOString()){const [user]=await db.select().from(users).where(eq(users.id,session.userId));if(user)return user;}
 }
 return null;
}

export async function isAdmin(request:Request){
 if(request.method!=='GET'&&!isSameOrigin(request))return false;
 return (await getAppUser())?.role==='admin';
}

export async function canManageBookings(request:Request){
 if(request.method!=='GET'&&!isSameOrigin(request))return false;
 const user=await getAppUser();
 return user?.role==='admin'||user?.role==='manager';
}
