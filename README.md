# buddhiworks.com

Static site (no build step): `index.html`, `404.html`, `assets/`, `vercel.json`.

## Put it live on Vercel (free)

1. Push this folder to a GitHub repo (Claude can do this once GitHub is connected).
2. On https://vercel.com/new, sign in with GitHub, pick the repo, click **Deploy**.
   Framework preset: **Other**. No build command. Output folder: the root.
3. In the Vercel project: **Settings > Domains > Add** `buddhiworks.com` and `www.buddhiworks.com`.
   Vercel shows the exact DNS records to add.
4. At the company where buddhiworks.com is registered, replace the old Netlify records with Vercel's.
   Keep any MX records (email) as they are.

## Edit text
All words are in `index.html`. Colours and fonts are at the top of `assets/styles.css`.
