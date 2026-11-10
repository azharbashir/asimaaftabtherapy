// Local HTTP previews cannot reliably retain Secure cookies in browsers.
// Production sessions always require HTTPS.
export function sessionCookie(request:Request,token:string,maxAge:number){
 const url=new URL(request.url);
 const localHttp=process.env.NODE_ENV==='development'&&url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname);
 return `practice_session=${token}; HttpOnly;${localHttp?'':' Secure;'} SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}
