import {requireChatGPTUser,chatGPTSignOutPath} from '../chatgpt-auth';
import {getAppUser} from '../../lib/admin';
import Dashboard from './dashboard';
export const dynamic='force-dynamic';
export default async function Admin(){
 await requireChatGPTUser('/admin');
 const user=await getAppUser();
 if(user?.role!=='admin')return <main style={{maxWidth:600,margin:'80px auto',padding:24}}><h1>Administrator access required</h1><p>Your account does not have access to the practice dashboard. Ask an administrator to add your email with the Admin role.</p><a href={chatGPTSignOutPath('/admin')} target="_top">Sign out and use another account</a></main>;
 return <Dashboard/>;
}
