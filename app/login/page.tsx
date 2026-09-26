import {authConfigured} from '@/lib/supabase/server';
import LoginForm from './form';
export const dynamic='force-dynamic';
export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){const params=await searchParams;return <main className="auth-shell"><section className="auth-card"><span className="auth-eyebrow">CAMPAIGN STUDIO</span><h1>Your next campaign starts here.</h1><p>Turn a business brief into a researched plan, editable content, and shareable creative.</p>{authConfigured()?<LoginForm failed={!!params.error}/>:<p role="status">Account setup is in progress. Please check back soon.</p>}<p className="auth-note">Create an account or sign in with Google. Your saved campaigns are private to your account. AI features have daily limits during testing.</p><p className="auth-note">Campaign details you submit for AI generation or research are processed by OpenAI. Avoid entering confidential or sensitive personal information.</p></section></main>}

