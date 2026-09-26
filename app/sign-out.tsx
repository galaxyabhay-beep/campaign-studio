"use client";
import {browserAuth} from '@/lib/supabase/client';
import {useState} from 'react';
export default function SignOut(){const [busy,setBusy]=useState(false);const [error,setError]=useState('');return <><button disabled={busy} onClick={async()=>{if(!window.confirm('Save any unsaved campaign changes before signing out. Sign out now?'))return;setBusy(true);const {error}=await browserAuth().auth.signOut({scope:'local'});if(error){setError('Could not sign out. Please retry.');setBusy(false);}else window.location.assign('/login');}}>Sign out</button>{error&&<span role="alert">{error}</span>}</>;}
