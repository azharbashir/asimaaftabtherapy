'use client';
import {useState,type FormEvent} from 'react';
export default function LoginForm(){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');const form=new FormData(e.currentTarget);try{const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.get('email'),password:form.get('password')})});const data=await r.json() as {error?:string};if(!r.ok)throw Error(data.error);window.location.assign('/admin');}catch(e){setError(e instanceof Error?e.message:'Unable to sign in.');setBusy(false);}}
 return <form onSubmit={submit}><label>Email<input name="email" type="email" required autoComplete="username"/></label><label>Password<input name="password" type="password" required maxLength={256} autoComplete="current-password"/></label><button className="button" disabled={busy}>{busy?'Signing in…':'Sign in'}</button><p role="alert">{error}</p></form>;
}
