# Three7 DFS landing page

Quarto website for **three7dfs.com**, published free on GitHub Pages.

## Files

| File | What it does |
|---|---|
| `index.qmd` | The home page text, including the NFL pricing section. Edit this to change wording, features or prices. |
| `privacy.qmd` | The privacy policy page (linked in the footer). Update the date at the top when you change it. |
| `_quarto.yml` | Site settings: navbar tabs, links, page title, footer. |
| `styles.scss` | Colors and layout (brand navy `#1A2332`, steel blue `#3E5C84`). |
| `images/` | Logo, small navbar logo, favicon. |
| `CNAME` | Tells GitHub Pages to serve the site at three7dfs.com. Don't delete. |
| `docs/` | The rendered website. This is what GitHub Pages publishes. |

## Editing the site

1. Open the folder in RStudio (Quarto is built in).
2. Edit `index.qmd` or `_quarto.yml`.
3. In the RStudio Terminal run `quarto render` (or `quarto preview` to see it live).
4. Commit and push. The live site updates within a minute or two.

## First-time publish

### 1. Put it on GitHub
1. Create a free account at github.com.
2. Create a new repository, e.g. `three7dfs-site`. (Public is required for free GitHub Pages.)
3. Upload everything in this folder, including `docs/`. GitHub Desktop or the "uploading an existing file" link on a new repo both work.

### 2. Turn on GitHub Pages
1. In the repo: **Settings → Pages**.
2. Source: **Deploy from a branch**. Branch: `main`, folder: `/docs`. Save.
3. Under **Custom domain**, enter `three7dfs.com` and save.

### 3. Point the domain at GitHub (Squarespace)
In Squarespace → Domains → three7dfs.com:

1. **Website → Domain Forwarding:** delete the rule that forwards the main domain to the MLB app.
2. **Website → Domain Forwarding:** add two rules (Remove paths, temporary redirect):
   - `nfl` → your NFL shinyapps.io link
   - `mlb` → `https://thirtyseven.shinyapps.io/MLB_DFS/`
3. **DNS → Custom records:** add four `A` records with host `@`:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
4. Add a `CNAME` record: host `www`, value `YOUR-GITHUB-USERNAME.github.io`.

If Squarespace has existing default A or CNAME records for `@` or `www`, remove them so they don't conflict.

### 4. Turn on HTTPS
Once GitHub shows the DNS check as successful (minutes to a few hours), go back to **Settings → Pages** and tick **Enforce HTTPS**.

### 5. Tell Google
Add the site in Google Search Console (search.google.com/search-console), verify with the DNS TXT record it gives you (add it in Squarespace DNS), and submit `https://three7dfs.com/sitemap.xml`.
