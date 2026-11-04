import {redirect} from 'next/navigation';
import {getChatGPTUser,chatGPTSignInPath} from '../chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Login(){
 if(await getChatGPTUser())redirect('/admin');
 return <main style={{maxWidth:480,margin:'100px auto',padding:28}}><h1>Practice login</h1><p>Sign in with the email your administrator added to access your practice workspace.</p><a href={chatGPTSignInPath('/admin')} target="_top">Sign in with ChatGPT</a></main>;
}
