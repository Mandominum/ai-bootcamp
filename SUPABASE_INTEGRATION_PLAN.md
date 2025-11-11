# Supabase Integration Plan

## Overview
Integrate Supabase as a real-time database backend for the to-do list app, replacing localStorage with a PostgreSQL database.

---

## What You Need to Do (Manual Steps)

### 1. Create Supabase Table
Go to your Supabase project → SQL Editor → New Query, and run this SQL:

```sql
-- Create todos table
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'General',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since no auth)
CREATE POLICY "Allow all operations on todos"
  ON todos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
CREATE INDEX idx_todos_category ON todos(category);
```

### 2. Get Your Supabase Credentials
1. Go to Project Settings → API in your Supabase dashboard
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### 3. Provide Credentials to Me
When I ask, you'll need to provide:
- Your Supabase Project URL
- Your Supabase Anon Key

### 4. Add Environment Variables to Vercel (After Deployment)
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add these variables:
   - `VITE_SUPABASE_URL` = Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase Anon Key
3. Redeploy the project

---

## What Will Be Automated

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js
```

### 2. Create Files

#### `.env` (Local development - gitignored)
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### `.env.example` (Template for others)
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

#### `todo-app/src/lib/supabase.js` (Supabase client)
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3. Update App.jsx
Replace localStorage logic with Supabase database operations:
- **Load todos**: Fetch from Supabase on component mount
- **Add todo**: Insert into Supabase table
- **Update todo**: Update in Supabase (toggle complete, edit text)
- **Delete todo**: Delete from Supabase
- **Real-time updates**: Optional - subscribe to changes

### 4. Update .gitignore
Ensure `.env` is excluded from git

### 5. Update README.md
Add setup instructions for Supabase integration

---

## Architecture Changes

### Before (localStorage)
```
React App → localStorage (browser only)
```

### After (Supabase)
```
React App → Supabase Client → PostgreSQL Database
```

---

## Benefits
- ✅ **Persistent data**: Todos saved across devices and browsers
- ✅ **Shared todos**: All users see the same todos (as requested)
- ✅ **Real-time sync**: Changes appear instantly for all users
- ✅ **Scalable**: PostgreSQL backend can handle many users
- ✅ **Backup**: Supabase automatically backs up your data

---

## Testing Plan
1. Test locally with `.env` file
2. Verify CRUD operations work
3. Test with multiple browser tabs (see real-time updates)
4. Deploy to Vercel with environment variables
5. Test production deployment

---

## Rollback Plan
If something goes wrong, we can revert to localStorage by:
1. Git revert to previous commit
2. Redeploy to Vercel

---

## Estimated Time
- Manual setup (Supabase table + credentials): **5 minutes**
- Automated code changes: **2 minutes**
- Testing locally: **3 minutes**
- Deploy to Vercel: **2 minutes**
- **Total: ~12 minutes**
