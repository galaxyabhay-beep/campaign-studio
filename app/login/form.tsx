"use client";
import {useState} from 'react';
import {browserAuth} from '@/lib/supabase/client';
export default function LoginForm({failed=false}:{failed?:boolean}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(failed?'Sign-in was not completed. Please try again.':'');
 async function signIn(){
  setBusy(true);setMessage('');
  try{
   const {error}=await browserAuth().auth.signInWithOAuth({provider:'google',options:{redirectTo:new URL('/auth/callback',window.location.origin).href}});
   if(error)throw error;
  }catch{setMessage('Google sign-in is unavailable right now. Please try again shortly.');setBusy(false);}
 }
 return <div className="auth-form"><button type="button" className="primary" disabled={busy} onClick={signIn}>{busy?'Opening Google…':'Continue with Google'}</button>{message&&<p role="status">{message}</p>}</div>;
}
