import {copyDefaults} from './copy-defaults';
export type Testimonial = {quote:string;name:string;location:string};
export type PhoneNumber = {label:string;number:string;whatsapp:boolean};
export type Stat = {value:string;label:string};
export type Item = {title:string;text:string};
export type Session = {title:string;subtitle:string;price:string;features:string};
export type Socials = {facebook:string;instagram:string;linkedin:string};
export type Article = {title:string;category:string;body:string;image:string;date:string};

export const defaults = {
 copy: {...copyDefaults},
 // Practice details
 name: 'Asima Aftab', tagline: 'Psychotherapist & Counsellor', email: '', credentials: '', fee: '',
 phones: [] as PhoneNumber[],
 socials: {facebook:'',instagram:'',linkedin:''} as Socials,
 // Home hero
 heroBadge: 'Psychotherapist & Counsellor', headline: 'You Don’t Have to\nFace It Alone.', intro: 'A compassionate space to pause, be heard, and explore what matters to you. Take your next step towards a more grounded, fulfilling life.', heroImage: '',
 // About
 about: 'Hello, I’m Asima. I believe that having space to talk openly can be the beginning of meaningful change. My aim is to offer a warm, thoughtful environment where you can explore your experiences at your own pace.',
 aboutClosing: 'Whether you’re dealing with anxiety, low mood, stress, relationship difficulties, or simply seeking personal growth — my goal is to support you with care and practical tools to improve your wellbeing.',
 aboutImage: '',
 // Highlights strip
 stats: [{value:'Confidential',label:'Safe & private'},{value:'Online',label:'Sessions anywhere'},{value:'Flexible',label:'At your own pace'},{value:'Caring',label:'Non-judgemental space'}] as Stat[],
 // Booking / contact
 bookingIntro: 'Please contact me to book an online appointment or to learn more. You don’t need the perfect words — just a willingness to take the first step.',
 quote: 'Growth occurs when individuals confront problems, struggle to master them, and through that struggle develop new aspects of their skills, capacities, and views about life.', quoteAuthor: 'Carl Jung',
 sessions: [
  {title:'Individual Session',subtitle:'50 minutes, one-to-one',price:'Flexible fees',features:'One-to-one online session\nFlexible appointment times\nConfidential & professional\nSecure video call'},
  {title:'Introductory Conversation',subtitle:'A first chat to find your fit',price:'Let’s talk first',features:'Ask questions before you commit\nShare what brings you here\nDiscuss fees & availability\nNo obligation to continue'}] as Session[],
 // Online therapy page
 onlineIntro: 'I provide secure online psychotherapy and counselling. All sessions are conducted via video call, making professional mental health support accessible from wherever you are.',
 onlineItems: [
  {title:'Who I Help',text:'I support adults facing anxiety, low mood, stress, relationship difficulties, low self-esteem, and life transitions. Sessions are tailored to your goals and pace.'},
  {title:'How Online Sessions Work',text:'Sessions take place by secure video call. After booking, you receive confirmation and your session details. You only need a private space and a stable internet connection.'},
  {title:'Secure & Confidential',text:'Your therapy is delivered in a secure, confidential format in line with professional ethical standards — so you can speak openly and safely.'},
  {title:'How to Book',text:'Use the booking page to choose your session and send your details, or contact me directly if you have questions before booking.'}] as Item[],
 // Footer
 footerText: 'Providing secure online psychotherapy and counselling in a safe, confidential, non-judgemental space — at a pace that feels right for you.',
 services: [
 {title:'Anxiety & overwhelm',text:'Make space to explore worries, recognise patterns, and find a steadier way through everyday challenges.',image:'',icon:'sun'},
 {title:'Low mood & depression',text:'Feel heard in difficult moments and explore small, manageable steps towards reconnection.',image:'',icon:'cloud'},
 {title:'Relationships & connection',text:'Explore communication, boundaries, and the relationships that shape your world.',image:'',icon:'heart'},
 {title:'Stress & life transitions',text:'Find time to reflect when life feels demanding, uncertain, or different from what you expected.',image:'',icon:'leaf'},
 {title:'Self-esteem & growth',text:'Get to know yourself with more compassion and explore what a meaningful life looks like for you.',image:'',icon:'sparkles'},
 {title:'Trauma & difficult experiences',text:'A sensitive space to discuss difficult experiences at a pace that feels right for you.',image:'',icon:'flower'}],
 articles: [{title:'What to expect from your first therapy session',category:'STARTING THERAPY',image:'',date:'',body:'Your first conversation is a chance to ask questions and talk about what brings you to therapy. You can share at your own pace. Discuss confidentiality, availability, and fees before deciding whether to continue.'},{title:'Making room for yourself in a busy world',category:'EVERYDAY WELLBEING',image:'',date:'',body:'Notice what takes your energy and what helps you feel restored. A quiet walk, a pause between tasks, or a clear boundary can create a little breathing space. Your needs deserve attention too.'}] as Article[],
 faqs:[{q:'How do I book an appointment?',a:'Complete the appointment request below. Your preferred date is a request, and your session is only confirmed after you receive a personal response.'},{q:'Where do sessions take place?',a:'You can request an online session. The meeting platform and joining details will be agreed when your appointment is confirmed.'},{q:'How much does a session cost?',a:'Fees and session duration will be discussed before you book. There is no payment collected through this website.'},{q:'Do I need to know what to talk about?',a:'You do not need to have everything worked out. Your first conversation is an opportunity to explore what you would like support with.'}],
 testimonials: [] as Testimonial[]
};
export type SiteContent = typeof defaults;

/** Older saved content may lack newer fields; fill them from defaults. The old single `phone` field becomes the first phone number. */
export const withDefaults = (d: Partial<SiteContent> & {phone?:string}): SiteContent => {
 const {phone, ...rest} = d;
 const merged: SiteContent = {...defaults, ...rest, copy: {...defaults.copy,...rest.copy}, socials: {...defaults.socials, ...rest.socials}, services: (rest.services ?? defaults.services).map(s=>({...s,image:s.image??''})), articles: (rest.articles ?? defaults.articles).map(a => ({...a, image: a.image ?? '', date: a.date ?? ''}))};
 if (!rest.phones && phone) merged.phones = [{label:'Phone / WhatsApp', number: phone, whatsapp: true}];
 return merged;
};
export const slugify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
/** "2025-01-29" → "29 Jan 2025". Formatted by hand so server and browser render identically. */
export const formatDate = (d: string) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d); return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : ''; };
export const readingTime = (s: string) => Math.max(1, Math.round(s.trim().split(/\s+/).length / 200));
export const lines = (s: string) => s.split('\n').map(x => x.trim()).filter(Boolean);
