const encoder=new TextEncoder();
async function derive(password,salt,iterations){
 const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations,hash:'SHA-256'},key,256);
 return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function hashPassword(password){
 const salt=crypto.randomUUID(),iterations=600000;
 return `pbkdf2:${iterations}:${salt}:${await derive(password,salt,iterations)}`;
}
export async function verifyPassword(password,stored){
 const parts=stored.split(':');
 const modern=parts.length===4&&parts[0]==='pbkdf2';
 const iterations=modern?Number(parts[1]):100000,salt=modern?parts[2]:parts[0],expected=modern?parts[3]:parts[1];
 if(!expected||!Number.isInteger(iterations)||iterations<100000||iterations>1000000)return false;
 const actual=await derive(password,salt,iterations);
 let difference=actual.length^expected.length;
 for(let i=0;i<actual.length;i++)difference|=actual.charCodeAt(i)^expected.charCodeAt(i);
 return difference===0;
}
export const DUMMY_PASSWORD_HASH='pbkdf2:600000:unknown-account:'+ '0'.repeat(64);
export async function tokenHash(token){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(token))),b=>b.toString(16).padStart(2,'0')).join('');}
