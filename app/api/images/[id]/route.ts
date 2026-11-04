import {eq} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {images} from '../../../../db/schema';

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[0-9a-f-]{36}$/.test(id))return new Response('Not found',{status:404});
 try{
  const row=(await getDb().select().from(images).where(eq(images.id,id)).limit(1))[0];
  if(!row)return new Response('Not found',{status:404});
  const bin=atob(row.data),bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  // Image ids are never reused, so the response can be cached indefinitely.
  return new Response(bytes,{headers:{'Content-Type':row.mime,'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}});
 }catch{return new Response('Image unavailable',{status:503});}
}
