import Studio from './studio';
import {authClient,authConfigured} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import SignOut from './sign-out';
export const dynamic='force-dynamic';
export default async function Home(){
 if(!authConfigured())redirect('/login');
 const client=await authClient();const {data:{user}}=await client.auth.getUser();
 if(!user||!user.email_confirmed_at)redirect('/login');
 return <><div className="account-strip"><span>{user.email}</span><SignOut/></div><Studio/></>;
}
