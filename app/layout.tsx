import {siteMetadata} from '../lib/site-metadata';
import type { Metadata } from 'next';
import './globals.css';
import './site.css';
export async function generateMetadata():Promise<Metadata>{return {...await siteMetadata("Asima Aftab | Psychotherapy & Counselling","A compassionate space to be heard. Explore therapy services and request a conversation with Asima Aftab."),icons:{icon:{url:"/favicon.svg?v=heart",type:"image/svg+xml"}}};}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
