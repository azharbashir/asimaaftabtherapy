'use client';
import {Copy,useCopy} from './copy';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Phone,Mail,CalendarDays,ArrowUp,X,Menu,HeartHandshake,ChevronRight} from 'lucide-react';
import {useContent,linkProps,waLink,firstWhatsapp} from './content';
import {SocialLinks,WhatsAppIcon} from './social';
import {useReveal,useScrollState,useSpotlight} from './motion';
import {CtaBand} from './sections';

export const nav=[['/','Home'],['/online-therapy','Online Therapy'],['/about','About Me'],['/blog','Blog'],['/faq','FAQ'],['/contact','Contact']] as const;

export function Brand({name,tagline,logoImage='',brandTagline='',light=false}:{name:string;tagline:string;logoImage?:string;brandTagline?:string;light?:boolean}){return <Link className={'s-brand'+(light?' light':'')} href="/" aria-label={name+' home'}><span className={'s-logo'+(logoImage?' custom':'')}>{logoImage?<img src={logoImage} alt=""/>:<HeartHandshake size={24} strokeWidth={1.6}/>}</span><span><b>{name}</b><small>{tagline}</small>{brandTagline&&<span className="s-brand-tagline">{brandTagline}</span>}</span></Link>;}


export function Shell({children}:{children:React.ReactNode}){const t=useCopy();
 const c=useContent(),path=usePathname()||'/';
 const [menu,setMenu]=useState(false),[stuck,setStuck]=useState(false),[scrolled,setScrolled]=useState(false);
 useReveal();
 useSpotlight();
 useScrollState(useCallback(({stuck,far}:{stuck:boolean;far:boolean})=>{setStuck(stuck);setScrolled(far);},[]));
 useEffect(()=>{if(!menu)return;const k=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(false);};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[menu]);
 const isActive=(h:string)=>h==='/'?path==='/':path===h||path.startsWith(h+'/');
 const phones=c.phones.filter(p=>p.number),wa=firstWhatsapp(c);
 return <div className={'site'+(menu?' menu-open':'')}>
  <div className="s-progress" aria-hidden/>
  <div className="s-topbar"><div className="s-wrap"><div>{phones.map((p,i)=><a key={i} {...linkProps(p)} title={p.label}>{p.whatsapp?<WhatsAppIcon size={13}/>:<Phone size={13}/>} {p.number}</a>)}{c.email&&<a href={'mailto:'+c.email}><Mail size={13}/> {c.email}</a>}{!phones.length&&!c.email&&<span><Copy text="Online psychotherapy & counselling"/></span>}</div><SocialLinks socials={c.socials}/>{!Object.values(c.socials).some(Boolean)&&<span className="s-topnote"><Copy text="Confidential · Online · Non-judgemental"/></span>}</div></div>
  <header className={'s-header'+(stuck?' stuck':'')}><div className="s-wrap"><Brand name={c.name} tagline={c.tagline} logoImage={c.logoImage} brandTagline={c.brandTagline}/><button className="s-menu" onClick={()=>setMenu(!menu)} aria-label={t("Toggle navigation")} aria-expanded={menu}><span key={String(menu)}>{menu?<X/>:<Menu/>}</span></button><nav className={menu?'open':''} onClick={()=>setMenu(false)}>{nav.map(([h,l],i)=><Link key={h} href={h} className={isActive(h)?'active':''} style={{'--i':i} as React.CSSProperties}>{t(l)}</Link>)}<Link className="s-btn" href="/booking"><CalendarDays size={17}/> <Copy text="Book a Session"/></Link></nav></div></header>
  <main><div key={path} className="s-page">{children}{!['/booking','/contact'].includes(path)&&<CtaBand/>}</div></main>
  <footer className="s-footer"><div className="s-wrap">
   <div className="s-foot-grid">
    <div><Brand name={c.name} tagline={c.tagline} logoImage={c.logoImage} brandTagline={c.brandTagline} light/><p>{c.footerText}</p><SocialLinks socials={c.socials} className="s-social lg"/></div>
    <div><h4><Copy text="Quick Links"/></h4>{nav.map(([h,l])=><Link key={h} href={h}><ChevronRight size={13}/>{t(l)}</Link>)}<Link href="/booking"><ChevronRight size={13}/><Copy text="Book a Session"/></Link></div>
    <div><h4><Copy text="Contact"/></h4>
     {c.email&&<a href={'mailto:'+c.email}><Mail size={14}/> {c.email}</a>}
     {phones.map((p,i)=><div key={i} className="s-foot-phone">{p.label&&<small>{p.label}</small>}<a {...linkProps(p)}>{p.whatsapp?<WhatsAppIcon size={14}/>:<Phone size={14}/>} {p.number}</a></div>)}
     <Link className="s-btn sm light" href="/booking"><CalendarDays size={15}/> <Copy text="Book a Session"/></Link></div>
   </div>
   <div className="s-foot-bottom"><span>© {new Date().getFullYear()} {c.name}<Copy text=". All rights reserved."/></span><span><Copy text="Confidential · Online Therapy · Not an emergency service ·"/> <a href="/admin"><Copy text="Practice dashboard"/></a></span></div>
  </div></footer>
  {wa&&<a className="s-fab wa" href={waLink(wa.number)} target="_blank" rel="noopener noreferrer" aria-label={t("Message on WhatsApp")}><WhatsAppIcon size={30}/></a>}
  <button className={'s-fab top'+(scrolled?' show':'')} onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} aria-label={t("Back to top")}><ArrowUp size={20}/></button>
 </div>;
}
