'use client';
import {Copy,useCopy} from './copy';
import {WhatsAppIcon} from './social';
import {useState} from 'react';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import {CalendarDays,CheckCircle2,Lock,Globe,Award,Users,Video,ShieldCheck,CalendarCheck,User,HeartHandshake,ArrowRight,Check} from 'lucide-react';
const onlineIcons=[Users,Video,ShieldCheck,CalendarCheck];
import {slugify,lines} from '../../lib/site-content';
import {useContent,img,serviceImages,waLink,firstWhatsapp} from './content';
import {Eyebrow,PageBanner,BookingForm} from './sections';

export function HomeHero(){const t=useCopy();
 const c=useContent();
 const headline=c.headline.split('\n').filter(Boolean);
 return <section className="s-hero"><span className="s-blob b1" aria-hidden/><span className="s-blob b2" aria-hidden/><span className="s-blob b3" aria-hidden/><div className="s-wrap s-hero-grid">
  <div className="s-hero-copy">
   {c.heroBadge&&<span className="s-pill"><span className="s-dot"/>{c.heroBadge}</span>}
   <h1>{headline.map((s,i)=>i===headline.length-1&&headline.length>1?<em key={i}>{s}</em>:<span key={i}>{s} </span>)}</h1>
   <p>{c.intro}</p>
   <div className="s-actions"><Link className="s-btn lg light" href="/booking"><CalendarDays size={18}/> <Copy text="Book a Session"/></Link><Link className="s-btn lg ghost" href="/about"><Copy text="Learn About Me"/></Link></div>
   <div className="s-trust"><span><CheckCircle2 size={18}/> <Copy text="Professional Support"/></span><span><Lock size={17}/> <Copy text="Confidential Sessions"/></span><span><Globe size={17}/> <Copy text="Online & Flexible"/></span></div>
  </div>
  <div className="s-hero-card"><div className="s-hero-frame"><img src={c.heroImage||img('1485955900006-10f4d324d411',1000)} alt={c.heroImage?c.name:'A green plant in a calm, light-filled space'}/></div><div className="s-float"><span><Award size={20}/></span><div><b>{c.name}</b><small>{c.tagline}</small></div></div><div className="s-float s-float-2"><span><Video size={18}/></span><b><Copy text="Secure video sessions"/></b></div></div>
  <a className="s-scroll" href="#about" aria-label={t("Scroll to about")}><span/><small><Copy text="Scroll"/></small></a>
 </div></section>;
}

function PricingAside(){const t=useCopy();
 const c=useContent(),wa=firstWhatsapp(c);
 return <aside className="s-price-box">
  <h3><Copy text="Session Pricing"/></h3>
  {c.sessions.map((s,i)=><div key={i} className={'s-price-row'+(i%2?' alt':'')}><div><b>{s.title}</b><small>{s.subtitle}</small></div><span>{s.price}</span></div>)}
  <ul>{['Professional, ethical practice','Flexible scheduling to suit you','Clear, transparent fees'].map(text=><li key={text}><CheckCircle2 size={16}/>{t(text)}</li>)}</ul>
  {wa?<a className="s-wa block" href={waLink(wa.number)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={19}/> <Copy text="WhatsApp:"/> {wa.number}</a>:<Link className="s-btn block" href="/booking"><CalendarDays size={17}/> <Copy text="Book a Session"/></Link>}
 </aside>;
}

export function OnlineTherapy(){
 const c=useContent();
 return <section className="s-sec s-cream"><div className="s-wrap s-split">
  <div>
   <Eyebrow left><Copy text="Online & Confidential"/></Eyebrow>
   <h2 className="s-h2"><Copy text="Accessible, Effective Online Therapy"/></h2>
   <p className="s-lead">{c.onlineIntro}</p>
   <div className="s-feature-list">{c.onlineItems.map((it,i)=>{const Icon=onlineIcons[i%onlineIcons.length];return <div key={i} className="s-feature spot"><span><Icon size={20}/></span><div><h3>{it.title}</h3><p>{it.text}</p></div></div>;})}</div>
   <div className="s-actions"><Link className="s-btn lg" href="/booking"><CalendarDays size={18}/> <Copy text="Book a Session"/></Link><Link className="s-btn lg outline" href="/contact"><Copy text="Contact Me"/></Link></div>
  </div>
  <PricingAside/>
 </div></section>;
}

export function BookingPage(){const t=useCopy();
 const c=useContent();
 const [session,setSession]=useState('');
 const choose=(t:string)=>{setSession(t);document.getElementById('book-form')?.scrollIntoView({behavior:'smooth',block:'start'});};
 return <>
  <PageBanner title={t("Book an Appointment")} subtitle={t("Take the first step toward a healthier, more balanced life.")}/>
  <section className="s-sec s-cream"><div className="s-wrap">
   <div className="s-head"><Eyebrow><Copy text="Choose Your Session"/></Eyebrow><h2><Copy text="Professional Psychotherapy Tailored to You"/></h2><p><Copy text="Choose the option that feels right for you — every journey starts with a conversation."/></p></div>
   <div className="s-plans">{c.sessions.map((s,i)=><div key={i} className={'s-plan spot'+(i%2?' alt':'')+(i===0?' featured':'')+(session===s.title?' chosen':'')}>
    <span className="s-plan-icon">{i%2?<HeartHandshake size={22}/>:<User size={22}/>}</span>
    <h3>{s.title}</h3>
    <strong>{s.price}</strong>
    <small>{s.subtitle}</small>
    <ul>{lines(s.features).map(f=><li key={f}><Check size={15}/>{f}</li>)}</ul>
    <button className={'s-btn block'+(i%2?' outline':'')} onClick={()=>choose(s.title)}><CalendarDays size={16}/> <Copy text="Book Now"/></button>
   </div>)}</div>
  </div></section>
  <section className="s-sec"><div className="s-wrap s-narrow">
   <div className="s-head"><Eyebrow><Copy text="Ready to Begin?"/></Eyebrow><h2><Copy text="Complete Your Booking"/></h2></div>
   <BookingForm session={session} onSession={setSession}/>
  </div></section>
 </>;
}

function SideCta(){
 return <div className="s-side-cta"><CalendarDays size={28}/><h3><Copy text="Ready to talk?"/></h3><p><Copy text="Book an online session at a time that suits you."/></p><Link className="s-btn light block" href="/booking"><Copy text="Book an Appointment"/></Link><Link className="s-side-link" href="/contact"><Copy text="Contact Me"/> <ArrowRight size={15}/></Link></div>;
}

export function TherapyDetail(){const t=useCopy();
 const c=useContent();
 const {slug}=useParams<{slug:string}>();
 const i=c.services.findIndex(s=>slugify(s.title)===slug);
 if(i<0)return <><PageBanner title={t("Therapy not found")}/><section className="s-sec"><div className="s-wrap s-center"><p className="s-lead"><Copy text="This page may have moved."/></p><Link className="s-btn" href="/#services"><Copy text="View all services"/></Link></div></section></>;
 const s=c.services[i];
 return <>
  <PageBanner title={s.title} subtitle={t("Personalised, compassionate online therapy")}/>
  <section className="s-sec s-cream"><div className="s-wrap s-detail">
   <article className="s-detail-main">
    <div className="s-detail-img"><img src={s.image||img(serviceImages[i%serviceImages.length],1200)} alt=""/></div>
    <Eyebrow left><Copy text="How I Can Help"/></Eyebrow>
    <h2 className="s-h2">{s.title}</h2>
    {s.text.split(/\n+/).filter(Boolean).map((p,k)=><p key={k} className="s-lead">{p}</p>)}
    <p className="s-lead"><Copy text="Together, we will work at a pace that feels right for you — exploring what you are experiencing, understanding the patterns behind it, and finding practical ways forward."/></p>
    <Link className="s-btn lg" href="/booking"><CalendarDays size={18}/> <Copy text="Get Help"/></Link>
   </article>
   <aside className="s-sidebar">
    <div className="s-side-box"><h4><Copy text="All Therapies"/></h4>{c.services.map(x=><Link key={x.title} href={'/therapies/'+slugify(x.title)} className={x.title===s.title?'active':''}>{x.title}<ArrowRight size={14}/></Link>)}</div>
    <SideCta/>
   </aside>
  </div></section>
 </>;
}
