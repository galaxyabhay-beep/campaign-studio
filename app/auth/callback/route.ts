import {NextResponse} from 'next/server';
import {authClient} from '@/lib/supabase/server';
export async function GET(request:Request){
 const url=new URL(request.url);
 const code=url.searchParams.get('code');
 if(code&&!url.searchParams.has('error')){
  try{
   const client=await authClient();
   const {error}=await client.auth.exchangeCodeForSession(code);
   if(!error){
    const response=NextResponse.redirect(new URL('/',url.origin));
    response.headers.set('Cache-Control','private, no-store');
    return response;
   }
  }catch{/* Return a generic error without provider details. */}
 }
 const response=NextResponse.redirect(new URL('/login?error=oauth',url.origin));
 response.headers.set('Cache-Control','private, no-store');
 return response;
}
