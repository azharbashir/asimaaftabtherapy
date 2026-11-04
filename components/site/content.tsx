'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {defaults,withDefaults,type SiteContent,type PhoneNumber} from '../../lib/site-content';

const Ctx=createContext<SiteContent>(defaults);
export const useContent=()=>useContext(Ctx);

export function ContentProvider({children}:{children:React.ReactNode}){
 const [c,setC]=useState<SiteContent>(defaults);
 useEffect(()=>{fetch('/api/content').then(r=>r.ok?r.json():null).then(d=>{if(d&&!(d as {error?:string}).error)setC(withDefaults(d as Partial<SiteContent>));}).catch(()=>{});},[]);
 return <Ctx.Provider value={c}>{children}</Ctx.Provider>;
}

export const img=(id:string,w=900)=>`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
export const serviceImages=['1499209974431-9dddcece7f88','1474418397713-7ede21d49118','1529156069898-49953e39b3ac','1516302752625-fcc3c50ae61f','1506126613408-eca07ce68773','1447752875215-b2761acb3c5d','1508672019048-805c876b67e2','1490750967868-88aa4486c946'];
export const articleImages=['1470252649378-9c29740c9fa8','1441974231531-c6227db76b6e'];
export const firstName=(n:string)=>n.trim().split(/\s+/)[0];
export const waLink=(p:string)=>'https://wa.me/'+p.replace(/[^\d]/g,'')+'?text='+encodeURIComponent('Hello, I would like to book an appointment.');
export const telLink=(p:string)=>'tel:'+p.replace(/[^\d+]/g,'');
/** WhatsApp numbers open a chat; other numbers start a call. */
export const linkProps=(p:PhoneNumber)=>p.whatsapp?{href:waLink(p.number),target:'_blank',rel:'noopener noreferrer'}:{href:telLink(p.number)};
export const firstWhatsapp=(c:SiteContent)=>c.phones.find(p=>p.whatsapp&&p.number);
export const excerpt=(s:string,n=120)=>s.length>n?s.slice(0,n-3).trimEnd()+'…':s;
