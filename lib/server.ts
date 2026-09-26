import {ZodError} from 'zod';
import 'server-only';
import {authClient,authConfigured} from '@/lib/supabase/server';
import {createClient} from '@supabase/supabase-js';

export async function owner(){if(!authConfigured())throw new HttpError(503,'Account setup is in progress.');const client=await authClient();const {data:{user},error}=await client.auth.getUser();if(error||!user||!user.email_confirmed_at)throw new HttpError(401,'Sign in with a verified email to use your campaign workspace.');return user.id;}
export class HttpError extends Error{constructor(public status:number,message:string){super(message)}}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)throw new HttpError(403,'This request must come from your campaign workspace.');}
export async function body(req:Request){const raw=await req.text();if(raw.length>150000)throw new HttpError(413,'This campaign is too large. Please shorten the content.');try{return JSON.parse(raw)}catch{throw new HttpError(400,'The request could not be read.');}}
export function failure(e:unknown){if(e instanceof ZodError)return Response.json({error:'Please check the supplied details: '+e.issues[0].message},{status:400});if(e instanceof HttpError)return Response.json({error:e.message},{status:e.status});console.error('Campaign request failed',e instanceof Error?e.message:'Unknown error');return Response.json({error:'We could not complete that step. Your current work is unchanged. Please try again.'},{status:500});}
export function runtime(){return process.env;}
function positiveLimit(value:string|undefined,fallback:number){const n=Number(value);return Number.isInteger(n)&&n>0?Math.min(n,1000):fallback;}
export async function reserveAI(user:string){
 if(process.env.AI_ENABLED!=='true')throw new HttpError(503,'AI generation is temporarily paused. You can still edit and export campaigns.');
 if(!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new HttpError(503,'AI usage controls are not configured.');
 const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await admin.rpc('reserve_ai_request',{p_user:user,p_user_limit:positiveLimit(process.env.AI_DAILY_USER_LIMIT,5),p_global_limit:positiveLimit(process.env.AI_DAILY_GLOBAL_LIMIT,50)});
 if(error)throw new HttpError(503,'AI usage controls are temporarily unavailable.');
 if(data!==true)throw new HttpError(429,'The daily AI allowance has been reached. You can still edit and export campaigns.');
}
export async function responseRequest(payload:Record<string,unknown>){const config=runtime();if(!config.OPENAI_API_KEY)throw new HttpError(503,'OpenAI is not connected yet. You can use the clearly labelled starter template meanwhile.');const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':`Bearer ${config.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:config.OPENAI_MODEL||'gpt-4.1-mini',store:false,...payload}),signal:AbortSignal.timeout(90000)});if(!r.ok)throw new HttpError(502,r.status===429?'OpenAI is currently rate limited or out of quota. Please check the connected account and try again.':'OpenAI could not complete this request. Please check the account connection and try again.');return r.json() as Promise<any>;}
export function outputText(data:any){return (data.output||[]).filter((o:any)=>o.type==='message').flatMap((o:any)=>o.content||[]).filter((c:any)=>c.type==='output_text').map((c:any)=>c.text).join('\n');}
