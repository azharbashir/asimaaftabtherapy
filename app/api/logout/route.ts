import {cookies} from 'next/headers';
import {getDb} from '../../../db';
import {sessions} from '../../../db/schema';
import {eq} from 'drizzle-orm';
import {tokenHash} from '../../../lib/password';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response(null,{status:403});
 const token=(await cookies()).get('practice_session')?.value;
 if(token)await getDb().delete(sessions).where(eq(sessions.id,await tokenHash(token)));
 return new Response(null,{status:303,headers:{Location:'/signout-with-chatgpt?return_to=%2Flogin','Set-Cookie':'practice_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'}});
}
