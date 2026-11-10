import {isSameOrigin} from '../../../lib/request-origin';
import {sessionCookie} from '../../../lib/session-cookie';
import {cookies} from 'next/headers';
import {getDb} from '../../../db';
import {sessions} from '../../../db/schema';
import {eq} from 'drizzle-orm';
import {tokenHash} from '../../../lib/password';
export async function POST(request:Request){
 if(!isSameOrigin(request))return new Response(null,{status:403});
 const token=(await cookies()).get('practice_session')?.value;
 if(token)await getDb().delete(sessions).where(eq(sessions.id,await tokenHash(token)));
 return new Response(null,{status:303,headers:{Location:'/login','Set-Cookie':sessionCookie(request,'',0)}});
}
