import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const db=new PGlite();
await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
await db.exec(readFileSync('./supabase/migrations/202609260001_campaigns.sql','utf8'));
const a='00000000-0000-4000-8000-000000000001',b='00000000-0000-4000-8000-000000000002';
await db.query('insert into auth.users values ($1),($2)',[a,b]);
async function asUser(id){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role authenticated');}
await asUser(a);await db.query('insert into public.campaigns(id,owner_id,title,data) values ($1,$2,$3,$4)', ['a',a,'A','{}']);
await asUser(b);assert.equal((await db.query('select * from public.campaigns')).rows.length,0);
for(const sql of ["update public.campaigns set title='stolen' where id='a' returning id","delete from public.campaigns where id='a' returning id"])assert.equal((await db.query(sql)).rows.length,0);
await assert.rejects(()=>db.query('insert into public.campaigns(id,owner_id,title,data) values ($1,$2,$3,$4)',['fake',a,'bad','{}']));
await assert.rejects(()=>db.query('select public.reserve_ai_request($1,2,3)',[b]));
await db.exec('reset role;set role anon');await assert.rejects(()=>db.query('select * from public.campaigns'));
await db.exec('reset role;set role service_role');
const reserve=async(user)=>(await db.query('select public.reserve_ai_request($1,2,3) as ok',[user])).rows[0].ok;
for(const [user,expected] of [[a,true],[a,true],[a,false],[b,true],[b,false]])assert.equal(await reserve(user),expected);
await db.exec('reset role');assert.equal((await db.query("select requests from public.ai_usage where bucket='global'")).rows[0].requests,3);
await asUser(a);for(const count of [1,0])assert.equal((await db.query("update public.campaigns set version=2 where id='a' and version=1 returning id")).rows.length,count);
console.log('PASS: owner isolation, cross-user writes/deletes blocked, anonymous denial, quota permissions, per-user/global quotas, stale-save conflict.');await db.close();

