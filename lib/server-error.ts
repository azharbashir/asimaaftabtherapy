/** Log only an error code and reference; database errors may contain personal data or credentials. */
export function logServerError(scope:string,error:unknown){
 const reference=crypto.randomUUID();
 let cause:unknown=error,code='UNKNOWN';
 for(let depth=0;depth<6&&cause&&typeof cause==='object';depth++){
  const detail=cause as {code?:unknown;name?:unknown;cause?:unknown};
  if(typeof detail.code==='string'&&/^[A-Za-z0-9_]+$/.test(detail.code))code=detail.code;
  else if(code==='UNKNOWN'&&typeof detail.name==='string')code=detail.name;
  cause=detail.cause;
 }
 console.error(`[${scope}] Request failed`,{reference,code});
 return reference;
}
