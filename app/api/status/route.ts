import {owner,runtime,failure} from '@/lib/server';
export async function GET(){try{await owner();return Response.json({aiConnected:!!runtime().OPENAI_API_KEY},{headers:{'Cache-Control':'no-store'}})}catch(e){return failure(e)}}
