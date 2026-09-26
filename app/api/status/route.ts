import {owner,runtime,failure} from '@/lib/server';
export async function GET(){try{await owner();const env=runtime();return Response.json({aiConnected:env.AI_ENABLED==='true'&&!!env.OPENAI_API_KEY&&!!env.SUPABASE_SERVICE_ROLE_KEY},{headers:{'Cache-Control':'private, no-store'}});}catch(e){return failure(e);}}
