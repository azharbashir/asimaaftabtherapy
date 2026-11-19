'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import UsersPanel from './users-panel';
import ReviewsPanel from './reviews-panel';
import AppointmentsPanel from './appointments-panel';
import './admin.css';
import {ArrowUpRight,CalendarDays,Settings,LayoutDashboard,Search,Trash2,Plus,Save,Home,Tags,HeartHandshake,Newspaper,HelpCircle,Quote,ArrowUp,ArrowDown,ImagePlus,Loader2,Menu,X,ChevronRight,ShieldCheck,Clock3,CheckCircle2,ArrowRight,ExternalLink,FileText,Globe} from 'lucide-react';
import {defaults,withDefaults,type SiteContent} from '../../lib/site-content';
type Appointment={id:string;name:string;email:string;phone:string|null;sessionType:string|null;message:string|null;service:string;date:string;timezone:string;status:string;createdAt:string};

const tabs=[['Overview',LayoutDashboard],['Appointments',CalendarDays],['Users',ShieldCheck],['Reviews',Quote],['Practice details',Settings],['Home & About',Home],['Sessions & Online Therapy',Tags],['Services',HeartHandshake],['Blog',Newspaper],['FAQs',HelpCircle],['Website text',Settings]] as const;
type Tab=typeof tabs[number][0];
const contentTabs:Tab[]=['Practice details','Home & About','Sessions & Online Therapy','Services','Blog','FAQs','Website text'];

function Field({label,value,onChange,rows,hint,type='text',placeholder}:{label:string;value:string;onChange:(v:string)=>void;rows?:number;hint?:string;type?:string;placeholder?:string}){
 return <label>{label}{rows?<textarea rows={rows} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/>:<input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/>}{hint&&<small className="field-hint">{hint}</small>}</label>;
}

/** Resize to at most 1600px and re-encode, so uploads stay small and fast to load. */
async function compress(file:File):Promise<Blob>{
 const bmp=await createImageBitmap(file);
 const scale=Math.min(1,1600/Math.max(bmp.width,bmp.height));
 const canvas=document.createElement('canvas');
 canvas.width=Math.round(bmp.width*scale);canvas.height=Math.round(bmp.height*scale);
 canvas.getContext('2d')!.drawImage(bmp,0,0,canvas.width,canvas.height);
 bmp.close();
 for(const [type,q] of [['image/webp',.82],['image/webp',.68],['image/jpeg',.8],['image/jpeg',.65]] as const){
  const blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,type,q));
  if(blob&&blob.type===type&&blob.size<1_400_000)return blob;
 }
 throw Error('This image is too large even after resizing. Please choose a smaller image.');
}

function ImageField({label,value,onChange,hint}:{label:string;value:string;onChange:(v:string)=>void;hint?:string}){
 const [busy,setBusy]=useState(false),[err,setErr]=useState(''),[over,setOver]=useState(false);
 async function upload(file?:File|null){
  if(!file)return;
  if(!file.type.startsWith('image/')){setErr('Please choose an image file.');return;}
  setBusy(true);setErr('');
  try{
   const blob=await compress(file),form=new FormData();
   form.append('file',new File([blob],'upload.'+(blob.type==='image/webp'?'webp':'jpg'),{type:blob.type}));
   const r=await fetch('/api/images',{method:'POST',body:form});const d=await r.json() as {url?:string;error?:string};
   if(!r.ok||!d.url)throw Error(d.error||'Upload failed.');
   onChange(d.url);
  }catch(e){setErr(e instanceof Error?e.message:'Upload failed.');}finally{setBusy(false);}
 }
 return <div className="image-field"><span className="image-label">{label}</span>
  <div className={'image-drop'+(over?' over':'')} onDragOver={e=>{e.preventDefault();setOver(true);}} onDragLeave={()=>setOver(false)} onDrop={e=>{e.preventDefault();setOver(false);upload(e.dataTransfer.files[0]);}}>
   {value?<img src={value} alt=""/>:<div className="image-empty"><ImagePlus size={26}/><span>Drag an image here</span></div>}
   {busy&&<div className="image-busy"><Loader2 size={22} className="spin"/> Uploading…</div>}
  </div>
  <div className="image-actions">
   <label className="button small upload-btn"><ImagePlus size={15}/>{value?'Replace image':'Upload image'}<input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={busy} onChange={e=>{upload(e.target.files?.[0]);e.target.value='';}}/></label>
   {value&&<button className="text-link danger" onClick={()=>onChange('')}><Trash2 size={15}/> Remove</button>}
  </div>
  {err&&<small className="image-error" role="alert">{err}</small>}
  <details className="image-url"><summary>Or paste an image link</summary><input type="url" placeholder="https://…" value={value.startsWith('/api/images/')?'':value} onChange={e=>onChange(e.target.value)}/></details>
  {hint&&<small className="field-hint">{hint}</small>}
 </div>;
}

/** Generic editor for a list of items: edit, reorder, remove, add. */
function ListEditor<T>({title,intro,items,onChange,blank,addLabel,render}:{title:string;intro?:string;items:T[];onChange:(v:T[])=>void;blank:T;addLabel:string;render:(item:T,set:(patch:Partial<T>)=>void)=>React.ReactNode}){
 const move=(i:number,d:number)=>{const j=i+d;if(j<0||j>=items.length)return;const n=[...items];[n[i],n[j]]=[n[j],n[i]];onChange(n);};
 return <div className="admin-panel"><h3>{title}</h3>{intro&&<p>{intro}</p>}
  {items.map((item,i)=><div className="edit-item" key={i}><div className="edit-item-heading"><span>Item {String(i+1).padStart(2,'0')}</span><span>Edit content</span></div>
   {render(item,patch=>onChange(items.map((v,j)=>j===i?{...v,...patch}:v)))}
   <div className="edit-actions"><button className="text-link" onClick={()=>move(i,-1)} disabled={i===0} aria-label="Move up"><ArrowUp size={15}/> Up</button><button className="text-link" onClick={()=>move(i,1)} disabled={i===items.length-1} aria-label="Move down"><ArrowDown size={15}/> Down</button><button className="text-link danger" onClick={()=>onChange(items.filter((_,j)=>j!==i))}><Trash2 size={15}/> Remove</button></div>
  </div>)}
  <button className="text-link" onClick={()=>onChange([...items,blank])}><Plus size={16}/> {addLabel}</button>
 </div>;
}

export default function Dashboard({role}:{role:'admin'|'manager'}){
 const manager=role==='manager';
 const [tab,setTab]=useState<Tab>(manager?'Appointments':'Overview'),[c,setC]=useState<SiteContent>(defaults),[rows,setRows]=useState<Appointment[]>([]),[query,setQuery]=useState(''),[filter,setFilter]=useState('All'),[msg,setMsg]=useState(''),[ready,setReady]=useState(false),[saving,setSaving]=useState(false),[dirty,setDirty]=useState(false),[copyQuery,setCopyQuery]=useState(''),[mobileOpen,setMobileOpen]=useState(false);
 useEffect(()=>{Promise.all([fetch('/api/content'),fetch('/api/appointments')]).then(async([a,b])=>{if(!a.ok||!b.ok)throw Error('Could not load your practice data. Please refresh.');setC(withDefaults(await a.json()));setRows(await b.json());setReady(true);}).catch(e=>setMsg(String(e)));},[]);
 useEffect(()=>{if(!dirty)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 const set=(patch:Partial<SiteContent>)=>{setC({...c,...patch});setDirty(true);};
 async function save(){setSaving(true);setMsg('');try{const r=await fetch('/api/content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(c)});const d=await r.json() as {error?:string};if(!r.ok)throw Error(d.error||'Changes could not be saved.');setDirty(false);setMsg('Website changes saved. They are now live on your website.');}catch(e){setMsg(e instanceof Error?e.message:String(e))}finally{setSaving(false)}}
 async function update(a:Appointment,status:string){const r=await fetch('/api/appointments',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:a.id,status})});if(r.ok)setRows(rows.map(x=>x.id===a.id?{...x,status}:x));else setMsg('Status could not be updated.');}
 async function remove(a:Appointment){if(!confirm('Permanently delete this appointment request and its contact details?'))return;const r=await fetch('/api/appointments',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:a.id})});if(r.ok)setRows(rows.filter(x=>x.id!==a.id));else setMsg('Request could not be deleted.');}
 const shown=rows.filter(a=>(filter==='All'||a.status===filter)&&(a.name+' '+a.email+' '+(a.phone??'')+' '+a.service+' '+(a.message??'')).toLowerCase().includes(query.toLowerCase()));
 const isContent=contentTabs.includes(tab);
 const go=(t:Tab)=>{if(manager&&t!=='Appointments')return;setTab(t);setMsg('');setMobileOpen(false);};
 useEffect(()=>{if(!mobileOpen)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setMobileOpen(false);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[mobileOpen]);
 const pending=rows.filter(a=>a.status==='New').length;
 const confirmed=rows.filter(a=>a.status==='Confirmed').length;
 const initials=c.name.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
 const statusCounts=['New','Contacted','Confirmed','Cancelled','Closed'].map(status=>({status,count:rows.filter(a=>a.status===status).length}));

 return <div className={'admin-layout'+(tab==='Appointments'?' appointments-view':'')}>
 {mobileOpen&&<button className="admin-backdrop" aria-label="Close navigation" onClick={()=>setMobileOpen(false)}/>}
 <aside id="admin-navigation" className={'sidebar'+(mobileOpen?' is-open':'')}>
  <div className="sidebar-brand"><Link className="brand" href="/"><span className="brand-mark"><img src={c.logoImage||'/favicon.svg?v=heart'} alt="" width={42} height={42}/></span><span>{c.name}<small>{c.brandTagline||'Practice workspace'}</small></span></Link><button className="mobile-close" aria-label="Close navigation" onClick={()=>setMobileOpen(false)}><X size={20}/></button></div>
  <nav className="admin-nav" aria-label="Dashboard navigation">{(manager?[['WORKSPACE',tabs.filter(([name])=>name==='Appointments')]]:[['WORKSPACE',tabs.slice(0,4)],['WEBSITE CONTENT',tabs.slice(4)]]) .map(([label,items])=><div className="nav-group" key={label as string}><span className="nav-label">{label as string}</span>{(items as typeof tabs[number][]).map(([name,Icon])=><button className={tab===name?'active':''} key={name} onClick={()=>go(name)} aria-current={tab===name?'page':undefined}><Icon size={18}/><span>{name==='Sessions & Online Therapy'?'Sessions & therapy':name}</span>{name==='Appointments'&&pending>0&&<span className="nav-count">{pending}</span>}{tab===name&&<ChevronRight className="nav-chevron" size={15}/>}</button>)}</div>)}</nav>
  <div className="sidebar-bottom"><form action="/api/logout" method="post"><button className="view-site" type="submit">Sign out</button></form><a href="/" target="_blank" rel="noopener noreferrer" className="view-site"><Globe size={17}/><span>View your website</span><ArrowUpRight size={16}/></a><div className="sidebar-profile"><span className="avatar">{initials}</span><div><strong>{c.name}</strong><small>{manager?'Booking manager':'Practice administrator'}</small></div><ShieldCheck size={17}/></div></div>
 </aside>
 <main className="admin-main"><header className="admin-top"><div className="admin-breadcrumb"><button className="mobile-toggle" aria-label="Open navigation" aria-expanded={mobileOpen} aria-controls="admin-navigation" onClick={()=>setMobileOpen(true)}><Menu size={21}/></button><span>Workspace</span><ChevronRight size={14}/><strong>{tab}</strong></div><div className="admin-top-right"><span className="admin-private"><ShieldCheck size={14}/> Private workspace</span><a href="/" target="_blank" rel="noopener noreferrer" className="admin-preview">Preview website <ExternalLink size={14}/></a><span className="avatar" aria-label={c.name}>{initials}</span></div></header><div className="admin-body">
  {tab!=='Appointments'&&<div className="section-heading"><div><span className="eyebrow">{isContent?'EDIT YOUR WEBSITE':'YOUR PRACTICE, AT A GLANCE'}</span><h1>{tab==='Overview'?'Your practice, at a glance.':tab}</h1><p className="muted">{tab==='Overview'?'Welcome back. Here’s what’s happening in your practice.':isContent?'Changes appear on your website as soon as you save.':'Manage your practice with everything in one place.'}</p></div>{isContent&&<div className="save-bar">{dirty&&<span className="unsaved">Unsaved changes</span>}<button className="button" onClick={save} disabled={!ready||saving}><Save size={17}/>{saving?'Saving…':'Save changes'}</button></div>}</div>}
  <p role="status" className={'admin-message'+(msg.startsWith('Website changes saved')?' success':'')}>{msg}</p>

  {tab==='Overview'&&<>
   <div className="overview-welcome"><div><span className="welcome-label"><span/> YOUR PRACTICE WORKSPACE</span><h2>A little clarity.<br/>More room for care.</h2><p>Keep appointments organised and your website up to date, all from one thoughtful space.</p><button className="button" onClick={()=>go('Appointments')}>Manage appointments <ArrowRight size={16}/></button></div><div className="welcome-art" aria-hidden="true"><div className="welcome-ring ring-one"/><div className="welcome-ring ring-two"/><div className="welcome-logo"><img src={c.logoImage||'/favicon.svg?v=heart'} alt="" width={146} height={146}/></div><span className="welcome-art-note"><ShieldCheck size={16}/> A space for your practice</span></div></div>
   <div className="stats">{[{title:'Total requests',value:rows.length,note:'All appointment enquiries',Icon:CalendarDays,tone:'teal'},{title:'Awaiting response',value:pending,note:pending?'Ready for your attention':'You’re all caught up',Icon:Clock3,tone:'amber'},{title:'Confirmed sessions',value:confirmed,note:'Appointments marked confirmed',Icon:CheckCircle2,tone:'violet'}].map(({title,value,note,Icon,tone})=><div key={title} className={'stat-card '+tone}><div className="stat-heading"><span>{title}</span><span className="stat-icon"><Icon size={19}/></span></div><strong>{ready?value:'—'}</strong><small>{note}</small></div>)}</div>
   <div className="overview-grid"><section className="admin-panel quick-actions"><div className="panel-kicker">MAKE IT YOURS</div><h3>Your website, beautifully maintained.</h3><p>A fresh introduction, a new article, or a small update. Keep your practice’s online home feeling like you.</p><div className="quick-action-grid">{[{title:'Practice details',description:'Contact & qualifications',Icon:Settings},{title:'Home & About',description:'Your story & introduction',Icon:Home},{title:'Blog',description:'Articles & reflections',Icon:FileText}].map(({title,description,Icon})=><button key={title} onClick={()=>go(title as Tab)}><span className="quick-icon"><Icon size={19}/></span><span><strong>{title}</strong><small>{description}</small></span><ArrowUpRight size={16}/></button>)}</div></section><section className="admin-panel request-breakdown"><div className="panel-kicker">APPOINTMENT ACTIVITY</div><h3>Every request, in view.</h3><div className="request-meter" aria-hidden="true">{rows.length?statusCounts.map(({status,count})=><span key={status} className={'status-'+status.toLowerCase()} style={{flexGrow:count}}/>):<span className="no-activity"/>}</div><div className="status-list">{statusCounts.map(({status,count})=><div key={status}><span><i className={'status-dot status-'+status.toLowerCase()}/>{status==='New'?'Awaiting response':status}</span><strong>{ready?count:'—'}</strong></div>)}</div><button className="text-link" onClick={()=>go('Appointments')}>View all requests <ArrowRight size={15}/></button></section></div>
  </>}

  {tab==='Appointments'&&<AppointmentsPanel rows={rows} setRows={setRows} content={c} ready={ready}/>}
  {tab==='Overview'&&<div className="admin-panel appointments-panel"><div className="section-heading"><div><span className="panel-kicker">YOUR CLIENT ENQUIRIES</span><h3>{tab==='Overview'?'Recent appointment requests':'Appointment requests'}</h3></div><span className="total-badge">{rows.length} total</span></div><div className="filters"><label className="search"><Search size={17}/><input placeholder="Search name, email, phone, service, or notes" aria-label="Search appointments" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="Filter by status" value={filter} onChange={e=>setFilter(e.target.value)}>{['All','New','Contacted','Confirmed','Cancelled','Closed'].map(s=><option key={s}>{s}</option>)}</select></div><div className="table-scroll"><table><thead><tr><th>CLIENT</th><th>SUPPORT AREA / SESSION</th><th>NOTES</th><th>PREFERRED DATE</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{shown.slice(0,tab==='Overview'?5:undefined).map(a=><tr key={a.id}><td><b>{a.name}</b><a href={'mailto:'+a.email}>{a.email}</a>{a.phone&&<a href={'tel:'+a.phone}>{a.phone}</a>}</td><td>{a.service}{a.sessionType&&<small>{a.sessionType}</small>}</td><td className="notes-cell">{a.message?(a.message.length>90?<details><summary>{a.message.slice(0,90).trimEnd()}… <span>Read more</span></summary><p>{a.message}</p></details>:<p>{a.message}</p>):<small>—</small>}</td><td>{a.date}<small>{a.timezone}</small></td><td><select className={'appointment-status status-'+a.status.toLowerCase()} aria-label={'Status for '+a.name} value={a.status} onChange={e=>update(a,e.target.value)}>{['New','Contacted','Confirmed','Cancelled','Closed'].map(s=><option key={s}>{s}</option>)}</select></td><td><button className="icon-button" onClick={()=>remove(a)} aria-label={'Delete request from '+a.name}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>{!shown.length&&<div className="empty"><span className="empty-icon"><CalendarDays size={27}/></span><h3>{ready?'A little quiet, for now.':'Loading requests…'}</h3><p>{query||filter!=='All'?'Try a different search or filter.':'When someone reaches out through your website, their request will appear here.'}</p></div>}</div>}

  {tab==='Users'&&<UsersPanel/>}
  {tab==='Reviews'&&<ReviewsPanel/>}

  {tab==='Website text'&&<div className="editor"><div className="admin-panel"><h3>All website text</h3><p>Edit headings, navigation, buttons, page banners, booking form labels and supporting text. Repeated wording is shared across the website. Leave a field empty to hide its text.</p><Field label="Find text" value={copyQuery} onChange={setCopyQuery}/>{Object.entries(c.copy).filter(([key,value])=>(key+' '+value).toLowerCase().includes(copyQuery.toLowerCase())).map(([key,value])=><Field key={key} label={key} value={value} rows={value.length>90?3:undefined} onChange={v=>set({copy:{...c.copy,[key]:v}})}/>)}</div></div>}

  {tab==='Practice details' &&<div className="editor">
   <div className="admin-panel"><h3>Logo &amp; tagline</h3><p>Personalise the branding in your website header, footer and dashboard. Upload a square PNG, JPG or WebP image; transparent PNG or WebP works well for logos.</p>
    <ImageField label="Logo image" value={c.logoImage} onChange={v=>set({logoImage:v})} hint="Leave empty to use the original logo icon. Your image is fitted without cropping."/>
    <Field label="Brand tagline" value={c.brandTagline} onChange={v=>set({brandTagline:v})} placeholder="Optional brand tagline" hint="Appears below your practice name and title. Leave empty to hide."/>
    <div className="branding-preview"><span>{c.logoImage?<img src={c.logoImage} alt="Logo preview"/>:<HeartHandshake size={30}/>}</span><div><strong>{c.name}</strong><small>{c.tagline}</small>{c.brandTagline&&<em>{c.brandTagline}</em>}</div></div>
   </div>
   <div className="admin-panel"><h3>Practice details</h3><p className="muted">Publish only qualifications and services that accurately reflect your practice.</p>
    <Field label="Display name" value={c.name} onChange={v=>set({name:v})}/>
    <Field label="Title under your name" value={c.tagline} onChange={v=>set({tagline:v})} hint="Shown in the header, footer and hero card, e.g. “Psychotherapist & Counsellor”."/>
    <Field label="Contact email" type="email" value={c.email} onChange={v=>set({email:v})}/>
    <Field label="Verified qualifications" rows={4} value={c.credentials} onChange={v=>set({credentials:v})} hint="One qualification per line. Shown as tags in the About section."/>
    <Field label="Session fee and duration" value={c.fee} onChange={v=>set({fee:v})} hint="Shown as a Fees card next to the booking form."/>
   </div>
   <ListEditor title="Phone numbers" intro="Shown in the top bar, the home page contact section, the contact page and the footer. The first WhatsApp number is also used for the floating WhatsApp button." items={c.phones} onChange={v=>set({phones:v})} blank={{label:'',number:'',whatsapp:true}} addLabel="Add phone number" render={(p,s)=><>
    <Field label="Label" value={p.label} onChange={v=>s({label:v})} placeholder="e.g. UK Clients — WhatsApp"/>
    <Field label="Number" type="tel" value={p.number} onChange={v=>s({number:v})} placeholder="+44 7xxx xxxxxx"/>
    <label className="check"><input type="checkbox" checked={p.whatsapp} onChange={e=>s({whatsapp:e.target.checked})}/> This number uses WhatsApp (links open a WhatsApp chat)</label>
   </>}/>
   <div className="admin-panel"><h3>Social media</h3><p>Leave blank to hide. Icons appear in the top bar and footer.</p>
    {(['facebook','instagram','linkedin'] as const).map(k=><Field key={k} label={k[0].toUpperCase()+k.slice(1)+' link'} type="url" value={c.socials[k]} placeholder="https://…" onChange={v=>set({socials:{...c.socials,[k]:v}})}/>)}
   </div>
   <div className="admin-panel"><h3>Footer</h3><Field label="Footer description" rows={3} value={c.footerText} onChange={v=>set({footerText:v})}/></div>
  </div>}

  {tab==='Home & About'&&<div className="editor">
   <div className="admin-panel"><h3>Home page hero</h3>
    <Field label="Badge above the headline" value={c.heroBadge} onChange={v=>set({heroBadge:v})}/>
    <Field label="Headline" rows={2} value={c.headline} onChange={v=>set({headline:v})} hint="Put the second line on a new line — it is shown in italics."/>
    <Field label="Introduction" rows={3} value={c.intro} onChange={v=>set({intro:v})}/>
    <ImageField label="Hero image" value={c.heroImage} onChange={v=>set({heroImage:v})} hint="Optional. Leave empty to use the default image. Square photos work best."/>
   </div>
   <div className="admin-panel"><h3>About section (“Hi! My name is …”)</h3>
    <Field label="About you" rows={6} value={c.about} onChange={v=>set({about:v})} hint="Separate paragraphs with a new line."/>
    <Field label="Closing paragraph" rows={3} value={c.aboutClosing} onChange={v=>set({aboutClosing:v})}/>
    <Field label="Full profile (About page)" rows={6} value={c.aboutFull} onChange={v=>set({aboutFull:v})}/>
    <Field label="Therapeutic philosophy" rows={6} value={c.philosophy} onChange={v=>set({philosophy:v})}/>
    <ImageField label="About image" value={c.aboutImage} onChange={v=>set({aboutImage:v})} hint="Optional. A photo of you works best here."/>
   </div>
   {(["approaches","specialisms"] as const).map(key=><ListEditor key={key} title={key==="approaches"?"Therapeutic approaches":"Additional areas of expertise"} items={c[key]} onChange={v=>set({[key]:v})} blank={{title:"",text:""}} addLabel="Add item" render={(item,u)=><><Field label="Title" value={item.title} onChange={v=>u({title:v})}/><Field label="Description (optional)" rows={2} value={item.text} onChange={v=>u({text:v})}/></>}/>)}
   <ListEditor title="Highlights strip" intro="The green band with large words, e.g. “Confidential — Safe & private”. Up to four look best. Only use figures that are accurate." items={c.stats} onChange={v=>set({stats:v})} blank={{value:'',label:''}} addLabel="Add highlight" render={(s,u)=><div className="form-row"><Field label="Large text" value={s.value} onChange={v=>u({value:v})}/><Field label="Small label" value={s.label} onChange={v=>u({label:v})}/></div>}/>
   <div className="admin-panel"><h3>Booking &amp; contact section</h3>
    <Field label="Introduction" rows={3} value={c.bookingIntro} onChange={v=>set({bookingIntro:v})}/>
    <Field label="Quote" rows={3} value={c.quote} onChange={v=>set({quote:v})} hint="Leave blank to hide the quote."/>
    <Field label="Quote author" value={c.quoteAuthor} onChange={v=>set({quoteAuthor:v})}/>
   </div>
  </div>}

  {tab==='Sessions & Online Therapy'&&<div className="editor">
   <ListEditor title="Session types" intro="Shown as cards on the Book a Session page, in the pricing box on the Online Therapy page, and in the booking form’s session list." items={c.sessions} onChange={v=>set({sessions:v})} blank={{title:'New session',subtitle:'',price:'',features:''}} addLabel="Add session type" render={(s,u)=><>
    <div className="form-row"><Field label="Title" value={s.title} onChange={v=>u({title:v})}/><Field label="Price" value={s.price} onChange={v=>u({price:v})} placeholder="e.g. £60 or Flexible fees"/></div>
    <Field label="Subtitle" value={s.subtitle} onChange={v=>u({subtitle:v})} placeholder="e.g. 50 minutes, one-to-one"/>
    <Field label="Features" rows={4} value={s.features} onChange={v=>u({features:v})} hint="One feature per line."/>
   </>}/>
   <div className="admin-panel"><h3>Online Therapy page</h3><Field label="Introduction" rows={3} value={c.onlineIntro} onChange={v=>set({onlineIntro:v})}/></div>
   <ListEditor title="Online Therapy information cards" items={c.onlineItems} onChange={v=>set({onlineItems:v})} blank={{title:'',text:''}} addLabel="Add card" render={(it,u)=><><Field label="Title" value={it.title} onChange={v=>u({title:v})}/><Field label="Text" rows={3} value={it.text} onChange={v=>u({text:v})}/></>}/>
  </div>}

  {tab==='Services'&&<div className="editor"><ListEditor title="Services" intro="Each service gets a card on the home page and its own detail page." items={c.services} onChange={v=>set({services:v})} blank={{title:'New service',text:'Describe your service.',icon:'leaf',image:'',badge:'Online therapy',duration:'',price:''}} addLabel="Add service" render={(s,u)=><><ImageField label="Service image" value={s.image} onChange={v=>u({image:v})}/><Field label="Title" value={s.title} onChange={v=>u({title:v})}/><Field label="Description" rows={4} value={s.text} onChange={v=>u({text:v})} hint="Separate paragraphs with a new line. The first part is shown on the card."/></>}/></div>}

  {tab==='Blog'&&<div className="editor"><ListEditor title="Blog articles" intro="Each article gets its own page. The first article is featured on the blog page, and the first three appear on the home page. Use Up/Down to change the order." items={c.articles} onChange={v=>set({articles:v})} blank={{title:'New article',category:'WELLBEING',body:'',image:'',date:new Date().toISOString().slice(0,10)}} addLabel="Add article" render={(a,u)=><><ImageField label="Cover image" value={a.image} onChange={v=>u({image:v})} hint="Landscape photos work best. Leave empty to use a default image."/><Field label="Title" value={a.title} onChange={v=>u({title:v})}/><div className="form-row"><Field label="Category" value={a.category} onChange={v=>u({category:v})} hint="Articles with the same category can be filtered together."/><Field label="Publish date" type="date" value={a.date} onChange={v=>u({date:v})} hint="Optional. Shown on the article."/></div><Field label="Article" rows={12} value={a.body} onChange={v=>u({body:v})} hint="Leave a blank line between paragraphs."/></>}/></div>}

  {tab==='FAQs'&&<div className="editor"><ListEditor title="Frequently asked questions" items={c.faqs} onChange={v=>set({faqs:v})} blank={{q:'New question',a:''}} addLabel="Add question" render={(f,u)=><><Field label="Question" value={f.q} onChange={v=>u({q:v})}/><Field label="Answer" rows={4} value={f.a} onChange={v=>u({a:v})}/></>}/></div>}

 </div></main></div>;
}
