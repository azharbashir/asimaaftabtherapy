'use client';
import {useContent} from './content';
export function useCopy(){const c=useContent();return (text:string)=>c.copy[text]??text;}
export function Copy({text}:{text:string}){const t=useCopy();return <>{t(text)}</>;}
