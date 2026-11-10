export function isSameOrigin(request:Request){
 const expected=new URL(process.env.APP_URL||request.url).origin;
 return request.headers.get('origin')===expected;
}
