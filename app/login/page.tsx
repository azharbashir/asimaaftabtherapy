import {redirect} from 'next/navigation';
import {chatGPTSignInPath} from '../chatgpt-auth';
import {getAppUser} from '../../lib/admin';
import LoginForm from './login-form';
export const dynamic='force-dynamic';
export default async function Login(){
 if(await getAppUser())redirect('/admin');
 return <main style={{maxWidth:480,margin:'80px auto',padding:28}}><h1 style={{fontSize:48,marginBottom:24}}>Practice login</h1><p style={{marginBottom:24}}>Sign in to your practice account.</p><LoginForm/><a style={{display:'inline-block',marginTop:24}} href={chatGPTSignInPath('/admin')} target="_top">Sign in with ChatGPT</a></main>;
}
