# ZETRAXUS Implementation - Verification Checklist

After completing the setup in QUICK_START.md, use this checklist to verify everything works.

---

## Pre-Setup Verification

- [ ] Supabase project created
- [ ] Project URL copied to .env.local
- [ ] Anon Key copied to .env.local
- [ ] SQL migration ran successfully (no errors)
- [ ] Forum categories inserted
- [ ] npm run dev started successfully

---

## Authentication Flow

### Registration
- [ ] Navigate to http://localhost:3000
- [ ] Click "Register" in header (top right)
- [ ] See registration form
- [ ] Fill in: Display Name, Email, Password (6+ chars)
- [ ] Click "Create account"
- [ ] See success message or email verification notice
- [ ] Check browser console for errors (should be none)

### Login
- [ ] Navigate to /auth/login
- [ ] Fill in email and password from registration
- [ ] Click "Sign in"
- [ ] Redirected to profile page
- [ ] User's display name appears in header (instead of "Register")
- [ ] Profile page shows "Welcome" or user info

### Logout
- [ ] Click "Logout" button in header
- [ ] Redirected to home
- [ ] Header shows "Register" and "Sign in" again
- [ ] Check network tab - session cleared

---

## Header / Navigation

### Logged Out
- [ ] "Sign in" button visible in header (desktop)
- [ ] "Register" button visible in header (desktop)
- [ ] Mobile menu shows "Sign in" and "Create account"
- [ ] Create menu hidden (desktop)

### Logged In
- [ ] Profile avatar circle with first letter shown (desktop)
- [ ] "Logout" button visible (desktop)
- [ ] Create menu visible (desktop)
- [ ] Mobile menu shows "Profile" and "Logout"

---

## User Profile

### Profile Page
- [ ] Navigate to /profile while logged in
- [ ] See user's display name
- [ ] See username (auto-generated or custom)
- [ ] See bio field (empty or filled)
- [ ] See avatar field
- [ ] See follower count
- [ ] See following count
- [ ] "Edit profile" button visible

### Edit Profile
- [ ] Click "Edit profile"
- [ ] Update display name (or leave unchanged)
- [ ] Update bio with some text
- [ ] Save changes
- [ ] Changes appear on profile page
- [ ] No console errors

### Public Profile
- [ ] Open browser dev tools → Network tab
- [ ] Navigate to /profile/[username]
- [ ] See another user's profile (create 2nd account to test)
- [ ] Profile info is readable
- [ ] "Follow" button appears (if not own profile)

---

## Follow System

### Following a User
- [ ] Create second account (or use existing)
- [ ] Log out, log back in as first user
- [ ] Navigate to second user's profile (need to implement profile links)
- [ ] Click "Follow" button
- [ ] Button changes to "Following"
- [ ] Follower count increases on their profile
- [ ] Following count increases on your profile

### Unfollowing
- [ ] Click "Following" button
- [ ] Button changes back to "Follow"
- [ ] Counts decrease accordingly

### Self-Follow Prevention
- [ ] Try to follow yourself (should fail)
- [ ] Check browser console for error
- [ ] Error: "Cannot follow yourself"

---

## Forum

### View Categories
- [ ] Navigate to /forum
- [ ] See forum categories (General, Projects, Worlds, Stories, Characters, Theory)
- [ ] Categories are clickable links (if implemented)
- [ ] No console errors

### Create Thread
- [ ] Click "Create Discussion" from Create menu (or implement forum button)
- [ ] See thread creation form
- [ ] Select a category
- [ ] Enter title and body
- [ ] Submit
- [ ] Thread appears in forum (if forum page implemented)
- [ ] Thread shows author info
- [ ] Thread shows timestamp

### View Thread
- [ ] Click on a thread
- [ ] See thread title and body
- [ ] See thread author with profile link
- [ ] See thread creation date
- [ ] See like button/count

### Create Reply
- [ ] On thread page, see reply form
- [ ] Enter reply text
- [ ] Submit
- [ ] Reply appears below thread
- [ ] Reply shows author
- [ ] Reply shows timestamp

### Edit/Delete Posts
- [ ] Create a thread or reply
- [ ] See "Edit" and "Delete" buttons (on own posts only)
- [ ] Click Edit, modify content, save
- [ ] Changes persist
- [ ] Click Delete, confirm
- [ ] Post removed

---

## Like System

### Like Thread
- [ ] On thread page, see like button with heart icon
- [ ] Like count shows (e.g., "❤️ 5")
- [ ] Click like button
- [ ] Heart changes to red (if implemented)
- [ ] Count increases
- [ ] Button changes to "Unlike"

### Unlike Thread
- [ ] Click "Unlike" button
- [ ] Count decreases
- [ ] Button changes back to "Like"

### Like Reply
- [ ] On reply, see like button
- [ ] Clicking works same as threads
- [ ] Count updates correctly

### Duplicate Prevention
- [ ] Try liking same thread twice
- [ ] Second like fails (error in console)
- [ ] Count doesn't increase

---

## Security

### Session Persistence
- [ ] Log in
- [ ] Refresh page (F5)
- [ ] Still logged in (session persists)
- [ ] Cookies exist (DevTools → Application → Cookies)

### Protected Actions
- [ ] Log out
- [ ] Try accessing /profile via URL
- [ ] Should redirect or show message
- [ ] Try creating thread via form
- [ ] Should require login

### Authorization
- [ ] Log in as User A
- [ ] Create a thread
- [ ] Edit only shows for your threads
- [ ] Switch to User B (new incognito window)
- [ ] Can see User A's thread
- [ ] Edit/Delete buttons NOT visible
- [ ] Trying to edit via API should fail

### Profile Access
- [ ] Each user has unique profile ID
- [ ] Cannot edit another user's profile
- [ ] Cannot modify another user's profile data via API

---

## Responsive Design

### Desktop (> 768px)
- [ ] Header shows Register/Sign in buttons
- [ ] Mobile menu button hidden
- [ ] All forms readable
- [ ] No overflow issues

### Tablet (768px - 1024px)
- [ ] Mobile menu appears when reduced
- [ ] Touch targets are large enough
- [ ] Forms stack vertically

### Mobile (< 768px)
- [ ] Hamburger menu visible
- [ ] Mobile menu pops out from right
- [ ] Forms are readable (not tiny)
- [ ] No horizontal scroll
- [ ] Touch buttons are large (44px+)

---

## Error Handling

### Invalid Email
- [ ] Try registering with invalid email
- [ ] See error: "Invalid email"
- [ ] Form doesn't submit

### Weak Password
- [ ] Try password < 6 characters
- [ ] See error: "Password must be at least 6 characters"
- [ ] Form doesn't submit

### Duplicate Email
- [ ] Register with same email twice
- [ ] See error about account existing
- [ ] Form doesn't submit

### Server Errors
- [ ] Check browser console (F12)
- [ ] No red errors shown
- [ ] Network tab shows successful requests
- [ ] All API responses are valid JSON

---

## Design Integrity

### Homepage
- [ ] Homepage looks exactly the same
- [ ] No style changes
- [ ] Star field visible
- [ ] Animations working
- [ ] Dark aesthetic intact

### Existing Pages
- [ ] /explore unchanged
- [ ] /projects unchanged
- [ ] /shop unchanged
- [ ] All original styling preserved

### New Pages
- [ ] /auth/login fits design
- [ ] /auth/register fits design
- [ ] No jarring color changes
- [ ] Consistent typography
- [ ] Consistent spacing

### Header
- [ ] Header structure unchanged
- [ ] Navigation links in same place
- [ ] Profile button updated but styled consistently
- [ ] Mobile menu styled consistently

---

## Performance

### Load Times
- [ ] Homepage loads < 2 seconds
- [ ] Auth pages load < 1 second
- [ ] Forum pages load < 2 seconds
- [ ] No blank white screens

### Network
- [ ] Supabase API calls succeed
- [ ] No 404 errors
- [ ] No CORS errors
- [ ] Session cookies set correctly

### Client
- [ ] No console errors
- [ ] No warnings (except possibly deps)
- [ ] Component renders without crashes

---

## Database

### Tables Exist
- [ ] profiles table exists in Supabase
- [ ] follows table exists
- [ ] forum_categories table exists
- [ ] forum_threads table exists
- [ ] forum_replies table exists
- [ ] thread_likes table exists
- [ ] reply_likes table exists

### Data Integrity
- [ ] New user creates profile automatically
- [ ] Profile username is unique
- [ ] Cannot insert duplicate follows
- [ ] Cannot insert duplicate likes
- [ ] Timestamps are set correctly

### RLS Working
- [ ] Users see all public data
- [ ] Users cannot read private data
- [ ] Users cannot modify others' data
- [ ] Supabase logs show RLS checks

---

## Final Checks

- [ ] No console errors (F12)
- [ ] No 404 errors
- [ ] No CORS issues
- [ ] All forms submit successfully
- [ ] All buttons work
- [ ] All links work
- [ ] Mobile responsive
- [ ] Design unchanged
- [ ] TypeScript strict (no `any` types)
- [ ] Ready for production

---

## Passing All Checks

✅ **You're done!** The implementation is complete and working.

If any checks fail:

1. **Check the error message** - Note exact text
2. **Review SUPABASE_SETUP.md** - See troubleshooting section
3. **Check Supabase logs** - Look for database errors
4. **Check browser console** - Look for JavaScript errors
5. **Check network tab** - Look for failed requests
6. **Verify .env.local** - Ensure credentials are correct

---

## Common Issues & Solutions

### "Cannot read property 'user' of undefined"
- Profile/auth data not loaded yet
- Add loading state with `useAuth()` hook

### "RLS policy violation"
- User doesn't have permission
- Check RLS policies in Supabase
- Verify user ID is correct

### "Table does not exist"
- Migration didn't run successfully
- Re-run SQL in Supabase SQL Editor
- Check for syntax errors

### "Invalid credentials"
- .env.local values wrong
- Restart dev server
- Copy values again carefully

### "Email not confirmed"
- Set email verification to optional in Supabase
- Or implement email confirmation flow

---

**After passing all checks, your ZETRAXUS implementation is production-ready!**
