import {getChatGPTUser} from '../app/chatgpt-auth';
import {getDb} from '../db';
import {cookies} from 'next/headers';
import {tokenHash} from './password';
import {sessions,users} from '../db/schema';
import {eq, and, isNull} from 'drizzle-orm';

export async function getAppUser(){
 const token=(await cookies()).get('practice_session')?.value;
 if(token){
  const db=getDb();
  const [session]=await db.select().from(sessions).where(eq(sessions.id,await tokenHash(token)));
  if(session&&session.expiresAt>new Date().toISOString()){const [user]=await db.select().from(users).where(eq(users.id,session.userId));if(user)return user;}
 }
 const identity=await getChatGPTUser();
 if(!identity)return null;
 const db=getDb();
 let [user]=await db.select().from(users).where(eq(users.authId,identity.userId));
 if(!user){
  // Bind a preapproved email to its stable platform identity on first login.
  await db.update(users).set({authId:identity.userId}).where(and(eq(users.email,identity.email.trim().toLowerCase()),isNull(users.authId)));
  [user]=await db.select().from(users).where(eq(users.authId,identity.userId));
 }
 return user??null;
}
export async function isAdmin(request:Request){
 if(request.method!=='GET'&&request.headers.get('origin')!==new URL(request.url).origin)return false;
 return (await getAppUser())?.role==='admin';
}
