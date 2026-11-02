import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Asima Aftab | Psychotherapy & Counselling',description:'A compassionate space to be heard. Explore therapy services and request a conversation with Asima Aftab.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
