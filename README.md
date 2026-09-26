# Campaign Studio

An AI-assisted campaign planner for small businesses, built as a hackathon first release.

## Features

- Business brief covering offer, audience, location, budget, available time, and language.
- Seven-day WhatsApp and Instagram campaign drafts using OpenAI.
- Public web research with source links.
- Editable content, review and approval, saved campaigns, and constrained replanning.
- Text campaign kits and downloadable promotional PNG images.
- English, Hindi, and bilingual generation.

## Scope

This version prepares material for human review and manual publishing. It does not send WhatsApp messages, schedule social posts, buy ads, or measure live campaign performance. The fictional bakery demo image is illustrative. Research and generated claims must be reviewed.

## Technology

React, TypeScript, Vinext, Tailwind CSS, OpenAI Responses API, and Cloudflare D1 with Drizzle. Production authentication is provided by Sites; local development uses a loopback-only demo identity.

## Local setup

Requires Node.js 22.13 or newer.

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` and enter your own OpenAI API key there. Never commit the real key.
3. Run `npm run build` to generate the local Worker configuration.
4. Apply the included database migration:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_jazzy_unus.sql
```

5. Run `npm run dev` and open the local URL printed in the terminal.

OpenAI calls use your API account and can incur charges. The application limits generation and research requests together to 20 per user per UTC day.

## Deployment

This app targets Sites on Cloudflare Workers with D1. The public source excludes the original owner's project ID. Register your own Site, configure its `project_id` in `.openai/hosting.json`, and set `OPENAI_API_KEY` as a server secret. Configure `OPENAI_MODEL` as appropriate. Another hosting provider requires adapting authentication and database bindings. GitHub Pages alone cannot run this server-backed app.

See [starter notes](STARTER-NOTES.md) for runtime details.

## Validation

The original application passed TypeScript checking, a production build, real bakery and workshop campaign generation, bilingual generation, save/reopen, approval and replan checks, request authorization checks, and mobile/desktop visual review.

## Privacy

API keys, local database contents, generated builds, original hackathon documents, and local tool files are excluded from this repository. Publishing this source does not change access to the owner's hosted application.
