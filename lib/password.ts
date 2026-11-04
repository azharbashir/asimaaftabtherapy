const encoder=new TextEncoder();
export async function hashPassword(password:string,salt=crypto.randomUUID()){
 const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations:100000,hash:'SHA-256'},key,256);
 return salt+':'+Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function verifyPassword(password:string,stored:string){
 const actual=await hashPassword(password,stored.split(':')[0]);
 let difference=actual.length^stored.length;
 for(let i=0;i<actual.length;i++)difference|=actual.charCodeAt(i)^stored.charCodeAt(i);
 return difference===0;
}
export async function tokenHash(token:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(token))),b=>b.toString(16).padStart(2,'0')).join('');}
