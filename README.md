# LifeOS

My life as a game: live age, goals, health, gym, journey, to-dos, XP, levels and achievements.
It works on phone, iPad and laptop, installs like an app, and costs nothing to host on GitHub Pages.

**Private by design.** Everything is encrypted in the browser with AES-256-GCM, using a key derived from your passphrase (PBKDF2, 310k rounds).
The public repo only ever holds `data.enc.json`. Without the passphrase, nobody can read it.

---

## 1. Deploy (about 5 minutes)

1. Create a new GitHub repo, e.g. `lifeos`. It can be public; your data is encrypted.
2. Upload **all files in this folder** to it, including `.nojekyll` and the `icons/` folder.
   - Drag and drop on github.com, or run:
     ```bash
     git init && git add . && git commit -m "LifeOS" && git branch -M main
     git remote add origin https://github.com/<you>/lifeos.git && git push -u origin main
     ```
3. In the repo, go to **Settings → Pages → Source: Deploy from a branch → `main` / root → Save**.
4. After about a minute, open `https://<you>.github.io/lifeos/`.

## 2. First run

- Choose **Start with sample data** to explore, or **Import my data.json** if Claude has built it from your details.
- Set a passphrase (8+ characters). **There is no recovery**, so don't lose it.
- "Remember this device" stores a non-extractable key in the browser, so you don't have to type the passphrase each time. **Lock** forgets it.

## 3. Saving and syncing across devices

Changes save instantly (encrypted) on the device you're using. To get them onto other devices:

**Option A: one-tap GitHub sync (recommended)**
1. On GitHub, go to **Settings → Developer settings → Fine-grained tokens → Generate new token**.
   - Repository access: *Only select repositories →* `lifeos`
   - Permissions: *Contents → Read and write*
2. In LifeOS, open **Vault → GitHub sync** and enter your owner, repo, branch and token, then save. The token is stored encrypted on that device only.
3. Tap the **sync badge** (top bar or sidebar) to push. Pages redeploys within about a minute. Use **Pull latest** on another device to fetch immediately.

**Option B: manual**
Tap the sync badge to download `data.enc.json`, then upload it to the repo, replacing the old one.

## 4. Install as an app
- **iPhone/iPad:** open in Safari → Share → *Add to Home Screen*.
- **Android/Chrome/desktop:** use the install icon in the address bar.
- It works offline once installed.

## 5. What's inside
| View | What it shows |
|---|---|
| **Home** | Level ring and XP bar, live age ticker (to 9 decimals), daily quests, smart insights, attribute radar, today's schedule, focus tasks, goals, 20-week consistency heatmap, XP chart, health and training snapshot |
| **Goals** | Progress rings, deadlines, days left, milestone checklists |
| **Health** | Health score, BMI (Asian cut-offs), daily check-in (mood, sleep, water, steps), metric trend charts vs targets, lab reports with reference-range bars |
| **Gym** | Weekly split, today's plan, workout logger, estimated-1RM personal records, training heatmap, weekly volume |
| **Meals** | Calorie and protein targets (Mifflin-St Jeor plus your surplus), today's menu with ✓ eaten, a 7-day plan you can swap, a recipe book with a recipe editor, and an automatic weekly grocery list |
| **Tasks** | Priority, attribute, due date; each completed task earns XP |
| **Journey** | Life timeline and a *Life in Weeks* grid with your milestones marked |
| **Trophies** | 5 attributes (STR, INT, VIT, DIS, CRE) with levels, plus 23 achievements |
| **Vault** | Sync, passphrase, import/export, raw JSON editor |

### How XP works
- Quests earn their own XP (a quest can be limited to certain days, e.g. gym Mon–Sat). Finishing every quest in a day earns a **+50 perfect-day** bonus.
- Tasks earn 15–30 XP, workouts 40–80, goal milestones 60, a completed goal 300, health logs 5, lab reports 25.
- XP is recalculated from your data every time, so it can't drift. Level *L* needs `50·L·(L−1)` total XP.
- Your streak counts days where you finish at least 50% of your quests.

## 6. Updating your data with Claude
Send Claude your details (DOB, reports, split, routine, goals…). Claude returns a `data.json` following `data.template.json`. Import it via **Vault → Import JSON**, then sync.
⚠️ Never commit a plain `data.json` or `lifeos-data.json`. `.gitignore` blocks them.
