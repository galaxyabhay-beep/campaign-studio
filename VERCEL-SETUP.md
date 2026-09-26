# Vercel public sign-up setup

This branch is the Next.js + Supabase migration. It does not trust Sites identity headers and does not use the original Cloudflare database. The existing Sites deployment is separate.

## Project settings

1. Create/select an owner-controlled Supabase project. Run `supabase/migrations/202609260001_campaigns.sql` once through migrations or the SQL editor.
2. Enable email authentication and public sign-ups. Keep email confirmation enabled. Configure a mail provider suitable for external users; Supabase's default mail service may restrict recipients and volume.
3. In the email templates for **Magic Link** and **Confirm Signup**, include `{{ .Token }}` as the sign-in code. The app uses a code entry flow, not a redirect link. Enable bot protection and configure its frontend integration before a large public launch if needed.
4. Import this repository and the `vercel-public-signup` branch in Vercel. Use the Next.js preset and Node.js 22 or newer. Select this branch as the project's production branch only after testing.
5. Set environment variables from `.env.example`. The Supabase publishable key is deliberately public; the service-role and OpenAI keys are server-only secrets. Never prefix a private key with `NEXT_PUBLIC_`.
6. Leave `AI_ENABLED=false` until storage, sign-in, and ownership isolation have passed verification. Set `AI_DAILY_USER_LIMIT=5` and `AI_DAILY_GLOBAL_LIMIT=50` initially. These are request caps, not a currency budget; failed requests after reservation also consume allowance.
7. Set Supabase's Site URL to the deployed origin and configure any required exact redirect URLs. Redeploy after changing environment variables.

## Validation before enabling public AI

- New email registration delivers a code and verifies the address.
- Existing user can sign in and sign out; invalid/expired codes are rejected.
- Two separate users can save their own campaigns; neither can read, update, or delete the other's data, including through the Supabase Data API.
- Signed-out API calls fail. Forged Sites user headers grant no access.
- Parallel saves produce a version conflict instead of overwriting edits.
- Concurrent AI reservations obey user and global limits; ordinary browser credentials cannot invoke the quota function.
- Real generation, web research, PNG downloads, and text exports work on Vercel.

## Status

Code migration is under test. Database migration, account configuration, email delivery, and deployment require the owner's connected projects. Existing local/Sites demo data is not copied automatically.

## Local validation completed

- TypeScript check and Next.js production build passed.
- PostgreSQL-compatible local tests passed for owner-only reads, blocked cross-user updates/deletes/inserts, anonymous denial, service-only quota reservation, per-user/global request caps, and stale-version saves.
- These local tests do not replace live Supabase sign-up, email delivery, two-account access, or Vercel end-to-end testing. Those remain pending until cloud setup is complete.
