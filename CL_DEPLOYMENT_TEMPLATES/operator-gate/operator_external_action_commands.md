# Community Premier League - Production Deployment Operator External Action Commands

These commands are a checklist template only. Do not paste real production secrets into files.

## Local preflight

```powershell
cd C:\Users\HP\community-league
npm run typecheck
npm run supabase:prod:contract
npm run operator:gate
npm run app:build
```

## Git external action gate

If this project is not yet a Git repository, initialise and connect the repository before Vercel import.

```powershell
cd C:\Users\HP\community-league
git init
git add .
git commit -m "Community League release candidate deployment preparation"
```

Then connect the repository to the chosen remote provider and push it.

## Supabase external action gate

1. Create production Supabase project.
2. Add production project secrets only to the secure host/operator vault.
3. Link Supabase CLI to production project only when ready.
4. Apply accepted migrations.
5. Run production validation SQL.

```powershell
cd C:\Users\HP\community-league
npx supabase login
npx supabase link --project-ref <PRODUCTION_PROJECT_REF>
npx supabase db push
```

## Vercel external action gate

1. Import the Git repository into Vercel.
2. Confirm Next.js framework.
3. Confirm install command: npm install.
4. Confirm build command: npm run app:build.
5. Add production variables through Vercel Project Settings.
6. Deploy preview.
7. Paste deployment URL and deployment logs back into ChatGPT for CL-039.