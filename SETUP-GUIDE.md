# Elevated Communications — Setup Guide (Windows)

Follow these steps in order. Each one is explained in plain English.

---

## STEP 1 — Install Node.js

Node.js is the engine that runs your app.

1. Go to: https://nodejs.org
2. Click the big green "LTS" download button
3. Run the installer — click Next on everything, keep all defaults
4. When done, press the Windows key, type **cmd**, open Command Prompt
5. Type: `node -v` and press Enter — you should see a version number like `v20.x.x`

---

## STEP 2 — Create a Supabase account (free database + logins)

1. Go to: https://supabase.com
2. Click "Start your project" → sign up with GitHub or email
3. Click "New project" — give it any name (e.g. "elevated-comms"), set a database password, pick a region
4. Wait 1-2 minutes for it to set up

### Create the database table:
1. In your Supabase project, click **SQL Editor** in the left menu
2. Click **New query**
3. Open the file `supabase-schema.sql` from this folder (open it with Notepad)
4. Copy everything in it and paste it into the SQL Editor
5. Click the green **Run** button
6. You should see "Success. No rows returned"

### Get your API keys:
1. Click **Settings** (gear icon) in the left menu → **API**
2. Copy the **Project URL** — you'll need it in Step 4
3. Copy the **anon public** key — you'll need it in Step 4

### Add your techs as users:
1. Click **Authentication** in the left menu → **Users** → **Add user**
2. Enter the email and password for each tech
3. Repeat for every tech on your team

---

## STEP 3 — Set up the app on your computer

1. Press Windows key, type **cmd**, open Command Prompt
2. Type this and press Enter:
   ```
   cd Desktop
   ```
3. Type this and press Enter (this copies the app files to your Desktop):
   ```
   mkdir elevated-communications
   ```
4. Copy the entire **elevated-communications** folder from wherever you downloaded it to your Desktop

---

## STEP 4 — Add your Supabase keys

1. Open the `elevated-communications` folder on your Desktop
2. Find the file called `.env.example`
3. Right-click it → Open with → Notepad
4. Replace `your_supabase_url_here` with your Project URL from Step 2
5. Replace `your_supabase_anon_key_here` with your anon key from Step 2
6. Click File → Save As
7. Change the filename to `.env.local` (exactly that, with the dot at the start)
8. Click Save

---

## STEP 5 — Install and run the app

1. Open Command Prompt again
2. Navigate to the app folder:
   ```
   cd Desktop\elevated-communications
   ```
3. Install the app's dependencies (do this once):
   ```
   npm install
   ```
4. Start the app:
   ```
   npm run dev
   ```
5. Open your browser and go to: **http://localhost:3000**
6. You should see the Elevated Communications login screen!

---

## STEP 6 — Deploy online (so techs can use it from their phone/laptop)

1. Go to: https://vercel.com → sign up for free
2. Connect your GitHub account (create one free at github.com if needed)
3. Push your code to GitHub (I can walk you through this)
4. In Vercel, click "New Project" → import your GitHub repo
5. Under "Environment Variables", add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
6. Click Deploy — Vercel gives you a live URL like `elevated-comms.vercel.app`
7. Share that URL with your techs!

---

## Troubleshooting

**"npm is not recognized"** → Node.js didn't install correctly. Re-run the installer from Step 1.

**"Cannot find module"** → Make sure you ran `npm install` in Step 5.

**Login says "Invalid credentials"** → Check that you created the user in Supabase Authentication (Step 2).

**Jobs aren't saving** → Make sure you ran the SQL schema in Step 2 and that your `.env.local` file has the correct keys.

---

Need help? Just ask Claude to walk you through any step!
