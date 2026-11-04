import type {Socials} from '../../lib/site-content';
const paths={
 facebook:'M14 8h3V4h-3c-2.8 0-4.5 1.9-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8Z',
 instagram:'M12 7.3A4.7 4.7 0 1 0 16.7 12 4.7 4.7 0 0 0 12 7.3Zm0 7.7a3 3 0 1 1 3-3 3 3 0 0 1-3 3Zm6-7.9a1.1 1.1 0 1 1-1.1-1.1A1.1 1.1 0 0 1 18 7.1ZM12 3.6c2.7 0 3 0 4.1.1 2.7.1 4 1.4 4.1 4.1.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 2.7-1.4 4-4.1 4.1-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-2.7-.1-4-1.4-4.1-4.1-.1-1.1-.1-1.4-.1-4.1s0-3 .1-4.1c.1-2.7 1.4-4 4.1-4.1 1.1-.1 1.4-.1 4.1-.1ZM12 2c-2.7 0-3.1 0-4.1.1C4.2 2.2 2.2 4.2 2.1 7.9 2 8.9 2 9.3 2 12s0 3.1.1 4.1c.1 3.7 2.1 5.7 5.8 5.8 1 .1 1.4.1 4.1.1s3.1 0 4.1-.1c3.7-.1 5.7-2.1 5.8-5.8.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1c-.1-3.7-2.1-5.7-5.8-5.8C15.1 2 14.7 2 12 2Z',
 linkedin:'M6.9 21H3.2V9h3.7ZM5 7.4A2.2 2.2 0 1 1 7.2 5.2 2.2 2.2 0 0 1 5 7.4ZM21 21h-3.7v-5.8c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H9.3V9h3.5v1.6a3.9 3.9 0 0 1 3.5-1.9c3.7 0 4.4 2.5 4.4 5.6Z',
} as const;
const labels={facebook:'Facebook',instagram:'Instagram',linkedin:'LinkedIn'} as const;
export function SocialLinks({socials,className='s-social'}:{socials:Socials;className?:string}){
 const keys=(Object.keys(paths) as (keyof Socials)[]).filter(k=>socials[k]);
 if(!keys.length)return null;
 return <div className={className}>{keys.map(k=><a key={k} href={socials[k]} target="_blank" rel="noopener noreferrer" aria-label={labels[k]}><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden><path d={paths[k]}/></svg></a>)}</div>;
}

const WA_PATH='M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.44 9.44 0 0 1-4.81-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.21 4.24-9.45 9.46-9.45a9.4 9.4 0 0 1 6.68 2.77 9.4 9.4 0 0 1 2.77 6.69c0 5.21-4.24 9.45-9.45 9.45m8.04-17.5A11.3 11.3 0 0 0 12.05.67C5.78.67.68 5.77.68 12.04c0 2 .52 3.96 1.52 5.68L.58 23.33l5.74-1.5a11.33 11.33 0 0 0 5.43 1.38h.01c6.26 0 11.36-5.1 11.36-11.37 0-3.04-1.18-5.89-3.33-8.04';
/** Official WhatsApp glyph (lucide has no brand icons). Inherits colour from the surrounding text. */
export function WhatsAppIcon({size=18,className}:{size?:number;className?:string}){
 return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden className={className}><path d={WA_PATH}/></svg>;
}
