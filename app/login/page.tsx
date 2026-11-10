import Link from 'next/link';
import {redirect} from 'next/navigation';
import {ArrowLeft,Leaf,ShieldCheck,Sun} from 'lucide-react';
import {getAppUser} from '../../lib/admin';
import LoginForm from './login-form';
import './login.css';
export const dynamic='force-dynamic';
export default async function Login(){
 if(await getAppUser())redirect('/admin');
 return <main className="practice-login">
  <section className="login-story" aria-label="Asima Aftab practice workspace">
   <Link className="login-brand" href="/"><span className="login-brand-icon"><Leaf size={25} strokeWidth={1.4}/></span><span>Asima Aftab<small>PSYCHOTHERAPY & COUNSELLING</small></span></Link>
   <div className="login-story-copy"><span className="login-kicker"><i/> YOUR PRACTICE, CONNECTED</span><h1>A little space.<br/>A clearer day.</h1><p>A thoughtful home for the work you do.<br/>Manage your practice with care and ease.</p><div className="login-landscape" aria-hidden="true"><div className="login-sun"/><div className="login-hill hill-back"/><div className="login-hill hill-front"/><span className="login-landscape-line"/></div></div>
   <div className="login-story-footer"><Sun size={17} strokeWidth={1.4}/><span>Care begins with a moment of calm.</span></div>
  </section>
  <section className="login-content"><Link className="login-back" href="/"><ArrowLeft size={15}/> Back to website</Link><div className="login-form-wrap"><span className="login-welcome-icon"><Leaf size={25} strokeWidth={1.5}/></span><span className="login-kicker">PRACTICE WORKSPACE</span><h2>Welcome back.</h2><p className="login-intro">Sign in to look after your practice.</p><LoginForm/><div className="login-help">Need access? <span>Ask your practice administrator.</span></div><div className="login-security"><ShieldCheck size={15}/><span>A private space for your practice</span></div></div><footer className="login-footer">Asima Aftab <span>·</span> Psychotherapy & Counselling</footer></section>
 </main>;
}
