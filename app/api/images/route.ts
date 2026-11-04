import {getDb} from '../../../db';
import {images} from '../../../db/schema';
import {isAdmin} from '../../../lib/admin';

const MAX_BYTES=1_500_000;
// Only accept real raster images, checked by their file signature rather than the declared type.
function sniff(b:Uint8Array):string|null{
 if(b[0]===0xff&&b[1]===0xd8&&b[2]===0xff)return 'image/jpeg';
 if(b[0]===0x89&&b[1]===0x50&&b[2]===0x4e&&b[3]===0x47)return 'image/png';
 if(b[0]===0x52&&b[1]===0x49&&b[2]===0x46&&b[3]===0x46&&b[8]===0x57&&b[9]===0x45&&b[10]===0x42&&b[11]===0x50)return 'image/webp';
 return null;
}
function toBase64(b:Uint8Array){let s='';for(let i=0;i<b.length;i+=0x8000)s+=String.fromCharCode(...b.subarray(i,i+0x8000));return btoa(s);}

export async function POST(request:Request){
 if(!await isAdmin(request))return Response.json({error:'Administrator sign-in required.'},{status:403});
 try{
  const form=await request.formData(),file=form.get('file');
  if(!(file instanceof File))return Response.json({error:'Please choose an image.'},{status:400});
  if(file.size>MAX_BYTES)return Response.json({error:'This image is too large. Please choose a smaller image.'},{status:413});
  const bytes=new Uint8Array(await file.arrayBuffer()),mime=sniff(bytes);
  if(!mime)return Response.json({error:'Please upload a JPG, PNG or WebP image.'},{status:415});
  const id=crypto.randomUUID();
  await getDb().insert(images).values({id,mime,data:toBase64(bytes),createdAt:new Date().toISOString()});
  return Response.json({url:'/api/images/'+id},{status:201});
 }catch{return Response.json({error:'The image could not be uploaded. Please try again.'},{status:500});}
}
