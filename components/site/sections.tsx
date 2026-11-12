'use client';
import './booking-success.css';
import {Copy,useCopy} from './copy';
import {WhatsAppIcon} from './social';
import {useEffect,useId,useRef,useState,useSyncExternalStore} from 'react';
import Link from 'next/link';
import {Mail,CalendarDays,CheckCircle2,Tag,ArrowRight,ArrowUpRight,Sparkles,MessagesSquare as Chat,Sprout,Home as HomeIcon,Phone,Plus,Quote,ChevronLeft,ChevronRight,Star,MessagesSquare} from 'lucide-react';
import {slugify} from '../../lib/site-content';
import type {Review,ReviewPage} from '../../lib/review-types';
import {bookingWhatsAppLink,type BookingWhatsAppDetails} from '../../lib/booking-whatsapp';
import {useContent,img,serviceImages,firstName,waLink,linkProps,firstWhatsapp} from './content';

export function Eyebrow({children,left=false}:{children:React.ReactNode;left?:boolean}){return <span className={'s-eyebrow'+(left?' left':'')}>{children}</span>;}

export function PageBanner({title,subtitle}:{title:string;subtitle?:string}){const t=useCopy();return <section className="s-banner"><span className="s-ring r1" aria-hidden/><span className="s-ring r2" aria-hidden/><div className="s-wrap">
 <nav className="s-crumbs" aria-label="Breadcrumb"><Link href="/"><HomeIcon size={14}/> {t('Home')}</Link><ChevronRight size={14}/><span aria-current="page">{t(title)}</span></nav>
 <h1>{t(title)}</h1>{subtitle&&<p>{t(subtitle)}</p>}</div><svg className="s-curve" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden><path d="M0 60V30C240 0 480 0 720 22s480 38 720 8v30Z"/></svg></section>;}

export function AboutSection(){
 const c=useContent();
 const quals=c.credentials.split(/\n|;|,(?![^()]*\))/).map(s=>s.trim()).filter(Boolean);
 return <section id="about" className="s-about s-sec"><div className="s-wrap s-about-grid">
  <div className="s-about-art"><div className="s-about-frame"><img src={c.aboutImage||img('1544027993-37dbfe43562a',900)} alt={c.aboutImage?c.name:'Two people talking in a calm, supportive conversation'}/></div></div>
  <div className="s-about-copy">
   <Eyebrow><Copy text="Who I Am"/></Eyebrow>
   <h2><Copy text="Hi! My name is"/> {firstName(c.name)}</h2>
   {c.about.split(/\n+/).filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}
   {c.aboutClosing&&<p>{c.aboutClosing}</p>}
   {quals.length>0&&<><h4 className="s-quals-title"><Copy text="Qualifications & Training"/></h4><div className="s-chips">{quals.map(q=><span key={q}><CheckCircle2 size={14}/>{q}</span>)}</div></>}
   <Link className="s-btn lg" href="/booking"><CalendarDays size={19}/> <Copy text="Book an Appointment"/></Link>
  </div>
 </div></section>;
}

export function ServicesSection(){
 const c=useContent();
 return <section className="s-services s-sec"><div className="s-wrap">
  <div className="s-head"><Eyebrow><Copy text="What I Offer"/></Eyebrow><h2><Copy text="Real Talk. Real Healing."/></h2><p><Copy text="Personalised therapy sessions to help you overcome challenges and achieve personal growth in a safe, supportive environment."/></p></div>
  <div className={'s-grid'+(c.services.length%4?' three':'')}>{c.services.map((s,i)=><article className="s-card spot" key={i}><div className="s-card-img"><img src={s.image||img(serviceImages[i%serviceImages.length],600)} alt="" loading="lazy"/><span className="s-num" aria-hidden>{String(i+1).padStart(2,'0')}</span></div><div className="s-card-body"><h3>{s.title}</h3><p>{s.text}</p><Link className="s-more b-link" href={'/therapies/'+slugify(s.title)}><Copy text="Learn More"/> <span><ArrowUpRight size={16}/></span></Link></div></article>)}</div>
 </div></section>;
}

/** Animates the leading number in values like "500+" or "8 years" when scrolled into view; other text is shown as-is. */
function CountUp({value}:{value:string}){
 const m=value.match(/^(\d+)([\s\S]*)$/),target=m?Number(m[1]):0;
 const ref=useRef<HTMLSpanElement>(null),[shown,setShown]=useState<number|null>(null);
 useEffect(()=>{
  const el=ref.current;if(!target||!el||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let raf=0;
  const io=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;io.disconnect();const t0=performance.now();
   const step=(t:number)=>{const p=Math.min((t-t0)/1400,1);setShown(p<1?Math.round(target*(1-Math.pow(1-p,3))):null);if(p<1)raf=requestAnimationFrame(step);};
   raf=requestAnimationFrame(step);},{threshold:.4});
  io.observe(el);return()=>{io.disconnect();cancelAnimationFrame(raf);};
 },[target]);
 return <span ref={ref}>{m&&shown!==null?shown+m[2]:value}</span>;
}

export function StatsBar(){
 const c=useContent(),items=c.stats.filter(s=>s.value);
 if(!items.length)return null;
 return <section className="s-stats"><div className="s-wrap" style={{gridTemplateColumns:`repeat(${Math.min(items.length,4)},1fr)`}}>{items.map((s,i)=><div key={i}><strong><CountUp value={s.value}/></strong><span>{s.label}</span></div>)}</div></section>;
}

export function ContactDetails(){const t=useCopy();
 const c=useContent(),wa=firstWhatsapp(c);
 return <div>
  <Eyebrow left><Copy text="Book a Session"/></Eyebrow>
  <h2><Copy text="It is never too late to start."/></h2>
  {c.bookingIntro&&<p>{c.bookingIntro}</p>}
  {c.quote&&<blockquote>“{c.quote}”{c.quoteAuthor&&<cite>— {c.quoteAuthor}</cite>}</blockquote>}
  <div className="s-contacts">
   {c.phones.filter(p=>p.number).map((p,i)=><a key={i} {...linkProps(p)}><span>{p.whatsapp?<WhatsAppIcon size={18}/>:<Phone size={17}/>}</span><div><small>{p.label||(p.whatsapp?t('WhatsApp'):t('Phone'))}</small><b>{p.number}</b></div></a>)}
   {c.email&&<a href={'mailto:'+c.email}><span><Mail size={17}/></span><div><small><Copy text="Email"/></small><b>{c.email}</b></div></a>}
   {c.fee&&<div className="s-contact"><span><Tag size={17}/></span><div><small><Copy text="Fees"/></small><b>{c.fee}</b></div></div>}
  </div>
  {wa&&<a className="s-wa" href={waLink(wa.number)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={19}/> <Copy text="Message on WhatsApp"/></a>}
 </div>;
}

export function BookingForm({session,onSession}:{session?:string;onSession?:(s:string)=>void}){const t=useCopy();
 const c=useContent(),wa=firstWhatsapp(c);
 const [whatsappUrl,setWhatsappUrl]=useState(''),[emailNotice,setEmailNotice]=useState('');
 const [message,setMessage]=useState(''),[busy,setBusy]=useState(false),[ok,setOk]=useState(false),[notes,setNotes]=useState('');
 const successDialog=useRef<HTMLDialogElement>(null),successId=useId();
 useEffect(()=>{if(ok&&!successDialog.current?.open)successDialog.current?.showModal();},[ok]);
 async function book(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;
  setBusy(true);setMessage('');setOk(false);setWhatsappUrl('');setEmailNotice('');
  const form=e.currentTarget;
  const data={...Object.fromEntries(new FormData(form)),timezone:Intl.DateTimeFormat().resolvedOptions().timeZone} as BookingWhatsAppDetails;
  try{
   const response=await fetch('/api/appointments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
   const result=await response.json().catch(()=>null) as {ok?:boolean;error?:string;email?:{client?:string}}|null;
   if(!response.ok||!result?.ok)throw Error(result?.error||t('Please try again.'));
   setWhatsappUrl(wa?bookingWhatsAppLink(wa.number,data):'');
   setEmailNotice(result.email?.client==='sent'?t('An acknowledgement email has been sent. Please check your inbox and spam folder.'):result.email?.client==='failed'?t('Your request is saved, but the acknowledgement email could not be sent. There is no need to submit again.'):'');
   setOk(true);setMessage(t('Thank you. Your request has been received. {name} will contact you to confirm your session.').replace('{name}',firstName(c.name)));
   form.reset();setNotes('');onSession?.('');
  }catch(error){setMessage(error instanceof Error&&error.message?error.message:t('Please try again.'));}finally{setBusy(false);}
 }
 return <><form id="book-form" className="s-form" onSubmit={book}>
  <h3><Copy text="Book an Appointment"/></h3><p><Copy text="Fill in the form below and I’ll get back to you to confirm your session."/></p>
  <div className="s-row"><label><Copy text="Full Name *"/><input name="name" required maxLength={120} placeholder={t("Your name")} autoComplete="name"/></label><label><Copy text="Email Address *"/><input type="email" name="email" required maxLength={254} placeholder={t("your@email.com")} autoComplete="email"/></label></div>
  <div className="s-row"><label><Copy text="Phone Number *"/><input type="tel" name="phone" required minLength={5} maxLength={40} pattern="[+\d\s()\-]+" placeholder={t("+44 7xxx xxxxxx")} autoComplete="tel"/></label><label><Copy text="Session Type *"/><select name="sessionType" required {...(onSession?{value:session??'',onChange:(e:React.ChangeEvent<HTMLSelectElement>)=>onSession(e.target.value)}:{defaultValue:''})}><option value="" disabled>{t("Select session type")}</option>{c.sessions.map(s=><option key={s.title}>{s.title}</option>)}</select></label></div>
  <div className="s-row"><label><Copy text="Preferred Date *"/><input name="date" type="date" required min={new Date().toISOString().slice(0,10)}/></label><label><Copy text="Support Area *"/><select name="service" required defaultValue=""><option value="" disabled>{t("Select an area")}</option>{c.services.map(s=><option key={s.title}>{s.title}</option>)}<option>{t("I’m not sure yet")}</option></select></label></div>
  <label className="s-notes"><Copy text="Message / Additional Notes"/> <span><Copy text="(optional)"/></span><textarea name="message" rows={4} maxLength={1000} value={notes} onChange={e=>setNotes(e.target.value)} placeholder={t("Any specific concerns or requests you’d like to share…")}/><small><span><Copy text="Please avoid sensitive personal or medical details — these can be discussed privately in your session."/></span><span aria-live="polite">{notes.length}/1000</span></small></label>
  <label className="s-consent"><input type="checkbox" required/> <Copy text="I agree to be contacted about my appointment request and understand my details will be stored for this purpose."/></label>
  <button className="s-btn lg block" disabled={busy}><CalendarDays size={18}/> {busy?t('Sending…'):t('Submit Booking Request')}</button>
  <small className="s-note"><Copy text="This is a request, not a confirmed booking. Dates depend on availability."/>{wa&&<span className="s-booking-whatsapp-hint"><WhatsAppIcon size={13}/><Copy text="After submitting, you can also share your request on WhatsApp."/></span>}</small>
  {!ok&&<p role="status" className="s-status err">{message}</p>}
 </form>
 <dialog ref={successDialog} className="s-booking-success" aria-labelledby={successId+'-title'} aria-describedby={successId+'-message'} onClose={()=>{setOk(false);setMessage('');setWhatsappUrl('');setEmailNotice('');}}>
  <div className="s-booking-success-icon"><CheckCircle2 size={34} strokeWidth={1.5}/></div>
  <span className="s-booking-success-kicker"><Copy text="THANK YOU FOR REACHING OUT"/></span>
  <h2 id={successId+'-title'}><Copy text="Request received"/></h2>
  <p id={successId+'-message'}>{message}</p>
  {emailNotice&&<p className="s-booking-email-notice" role="status">{emailNotice}</p>}
  <div className="s-booking-success-note"><CalendarDays size={17}/><span><Copy text="Your session will be confirmed after we contact you."/></span></div>
  {whatsappUrl&&<div className="s-booking-whatsapp"><a className="s-btn lg block" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={19}/><Copy text="Send booking on WhatsApp"/></a><p><Copy text="Review your booking details in WhatsApp, then tap Send."/></p></div>}
  <button type="button" className={'s-btn lg block'+(whatsappUrl?' s-booking-done':'')} autoFocus onClick={()=>successDialog.current?.close()}><Copy text="Done"/></button>
 </dialog></>;
}

export function BookingSection(){return <section className="s-booking s-sec"><div className="s-wrap s-booking-grid"><ContactDetails/><BookingForm/></div></section>;}

export function FaqList(){
 const c=useContent();
 return <div className="s-faq-list">{c.faqs.map((f,i)=><details key={i}><summary><span className="s-qnum" aria-hidden>{String(i+1).padStart(2,'0')}</span><span className="s-q">{f.q}</span><Plus size={20}/></summary><p>{f.a}</p></details>)}</div>;
}

const AUTOPLAY_MS=5500;
function useMedia(query:string){
 return useSyncExternalStore(cb=>{const m=window.matchMedia(query);m.addEventListener('change',cb);return()=>m.removeEventListener('change',cb);},()=>window.matchMedia(query).matches,()=>false);
}

export function Testimonials(){const t=useCopy();
 const [testimonials,setTestimonials]=useState<Review[]>([]),[loading,setLoading]=useState(true),[failed,setFailed]=useState(false);
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/api/reviews?sort=recent',{signal:controller.signal,cache:'no-store'})
   .then(async response=>{if(!response.ok)throw Error('Reviews unavailable');return await response.json() as ReviewPage;})
   .then(result=>{if(!controller.signal.aborted){setTestimonials(result.reviews);setFailed(false);}})
   .catch(()=>{if(!controller.signal.aborted)setFailed(true);})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return ()=>controller.abort();
 },[]);
 const perView=useMedia('(max-width: 768px)')?1:2,reduced=useMedia('(prefers-reduced-motion: reduce)');
 const [index,setIndex]=useState(0),[hover,setHover]=useState(false),[focus,setFocus]=useState(false);
 const startX=useRef<number|null>(null);
 const n=testimonials.length,pages=Math.max(1,n-perView+1),idx=index%pages,auto=!reduced&&pages>1,paused=hover||focus;
 useEffect(()=>{if(!auto||paused)return;const id=setInterval(()=>{if(!document.hidden)setIndex(i=>(i+1)%pages);},AUTOPLAY_MS);return()=>clearInterval(id);},[auto,paused,pages,idx]);
 const go=(d:number)=>setIndex((idx+d+pages)%pages);
 return <section className="s-testimonials s-sec"><div className="s-wrap">
  <div className="s-head"><span className="s-tag"><Copy text="Testimonials"/></span><h2><Copy text="Reflections from our clients"/></h2></div>
  {n>0?<div className="s-carousel" role="region" aria-roledescription="carousel" aria-label={t("Client testimonials")}
   onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocus={()=>setFocus(true)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocus(false);}}
   onPointerDown={e=>{startX.current=e.clientX;}} onPointerUp={e=>{if(startX.current===null)return;const dx=e.clientX-startX.current;startX.current=null;if(Math.abs(dx)>50&&pages>1)go(dx<0?1:-1);}}>
   {pages>1&&<button className="s-tnav prev" onClick={()=>go(-1)} aria-label={t("Previous testimonial")}><ChevronLeft/></button>}
   <div className="s-tviewport"><div className={'s-ttrack'+(pages===1?' center':'')} style={{transform:`translateX(-${idx*100/perView}%)`}} aria-live={auto&&!paused?'off':'polite'}>
    {testimonials.map((x,i)=>{const visible=i>=idx&&i<idx+perView;return <div key={x.id} className={'s-tslide'+(visible?' on':'')} style={{flex:`0 0 ${100/perView}%`}} aria-hidden={!visible} role="group" aria-roledescription="slide" aria-label={`${i+1} of ${n}`}>
     <figure className="s-tcard spot"><Quote size={30}/><blockquote>{x.body}</blockquote><figcaption><span className="s-avatar" aria-hidden>{(x.displayName||'A').trim()[0].toUpperCase()}</span><div><b>{x.displayName||'Anonymous'}</b><small className="s-tservice">{x.service}</small></div><span className="s-stars" role="img" aria-label={`${x.rating} out of 5 stars`}>{[1,2,3,4,5].map(k=><Star key={k} size={14} fill={k<=x.rating?'currentColor':'none'}/>)}</span></figcaption></figure>
    </div>;})}
   </div></div>
   {pages>1&&<button className="s-tnav next" onClick={()=>go(1)} aria-label={t("Next testimonial")}><ChevronRight/></button>}
  </div>
  :<p className="s-testimonial-status" role="status">{loading?'Loading client reflections…':failed?'Client reviews are temporarily unavailable.':'There are no published reviews yet. You’re welcome to share your experience.'}</p>}
  {pages>1&&<div className="s-tcontrols">
   <div className="s-dots">{Array.from({length:pages},(_,i)=><button key={i} className={i===idx?'on':''} onClick={()=>setIndex(i)} aria-label={`Show testimonial ${i+1}`} aria-current={i===idx}/>)}</div>
   {auto&&<div className="s-tprogress" aria-hidden><span key={idx+(paused?"p":"r")} style={{animationDuration:AUTOPLAY_MS+'ms',animationPlayState:paused?'paused':'running'}}/></div>}
  </div>}
  <div className="s-testimonials-link"><Link className="s-btn light" href="/reviews">{n?'Read all reviews':'Read & share reviews'}<ArrowUpRight size={16}/></Link></div>
 </div></section>;
}

export function StillQuestions(){return <div className="s-still"><MessagesSquare size={28}/><div><h3><Copy text="Still have questions?"/></h3><p><Copy text="I’m happy to help — reach out and I’ll get back to you."/></p></div><Link className="s-btn" href="/contact"><Copy text="Contact Me"/></Link></div>;}

/** Endless ticker of services under the hero. The second copy exists only for the seamless loop. */
export function ServiceTicker(){
 const c=useContent(),items=c.services.map(s=>s.title).filter(Boolean);
 if(!items.length)return null;
 const row=(hidden:boolean)=><div className="s-ticker-row" aria-hidden={hidden||undefined}>{items.map((x,i)=><span key={i}><Sparkles size={16}/>{x}</span>)}</div>;
 return <div className="s-ticker"><div className="s-ticker-track">{row(false)}{row(true)}</div></div>;
}

export function ProcessSection(){const t=useCopy();
 const steps=[[Chat,'Reach out','Send a booking request or message me on WhatsApp — whichever feels easiest.'],[CalendarDays,'Let’s talk','We’ll have a first conversation to understand what brings you here and answer your questions.'],[Sprout,'Begin your journey','Start regular sessions at a pace that feels right, with support tailored to you.']] as const;
 return <section className="s-process s-sec"><div className="s-wrap">
  <div className="s-head"><Eyebrow><Copy text="How It Works"/></Eyebrow><h2><Copy text="Your first steps to feeling better"/></h2><p><Copy text="Starting therapy is simple. Here’s what to expect."/></p></div>
  <ol className="s-steps">{steps.map(([Icon,title,text],i)=><li key={title} className="s-step spot"><span className="s-step-n" aria-hidden>{i+1}</span><span className="s-step-icon"><Icon size={26} strokeWidth={1.6}/></span><h3>{t(title)}</h3><p>{t(text)}</p></li>)}</ol>
 </div></section>;
}

export function CtaBand(){const t=useCopy();
 const c=useContent(),wa=firstWhatsapp(c);
 return <section className="s-cta-wrap"><div className="s-wrap"><div className="s-cta-band">
  <span className="s-ring r1" aria-hidden/><span className="s-ring r2" aria-hidden/>
  <div><h2><Copy text="Ready to take the first step?"/></h2><p><Copy text="Reaching out is a sign of strength. Book a confidential online session today."/></p></div>
  <div className="s-actions"><Link className="s-btn lg light-solid" href="/booking"><CalendarDays size={18}/> {t('Book a Session')} <ArrowRight size={17}/></Link>{wa?<a className="s-btn lg ghost" href={waLink(wa.number)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={19}/> {t('WhatsApp')}</a>:<Link className="s-btn lg ghost" href="/contact">{t('Get in Touch')}</Link>}</div>
 </div></div></section>;
}
