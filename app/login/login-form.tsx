'use client';
import {useState,type FormEvent} from 'react';
import {ArrowRight,Eye,EyeOff,LoaderCircle,AlertCircle} from 'lucide-react';
export default function LoginForm(){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[showPassword,setShowPassword]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');const form=new FormData(e.currentTarget);try{const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.get('email'),password:form.get('password')})});const raw=await r.text();let data:{ok?:boolean;error?:string}|null=null;try{data=JSON.parse(raw);}catch{/* A hosting proxy may return an empty body or an HTML error page. */}if(!r.ok||data?.ok!==true)throw Error(typeof data?.error==='string'?data.error:'Sign-in is temporarily unavailable. Please try again later or contact the practice administrator.');window.location.assign('/admin');}catch(e){setError(e instanceof Error?e.message:'Unable to sign in.');setBusy(false);}}
 return <form className="login-form" onSubmit={submit} aria-busy={busy}>
  <label htmlFor="login-email">Email address<input id="login-email" name="email" type="email" placeholder="you@example.com" required autoComplete="username" disabled={busy}/></label>
  <label htmlFor="login-password">Password<span className="login-password"><input id="login-password" name="password" type={showPassword?'text':'password'} placeholder="Enter your password" required maxLength={256} autoComplete="current-password" disabled={busy}/><button type="button" className="login-reveal" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Hide password':'Show password'} aria-pressed={showPassword}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></label>
  {error&&<p className="login-error" role="alert"><AlertCircle size={16}/><span>{error}</span></p>}
  <button className="login-submit" type="submit" disabled={busy}>{busy?<><LoaderCircle className="login-spinner" size={18}/>Signing in…</>:<>Sign in to workspace<ArrowRight size={18}/></>}</button>
 </form>;
}
