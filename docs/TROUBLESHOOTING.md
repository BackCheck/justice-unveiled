# HRPM.org Troubleshooting Guide

## Common Issues and Solutions

This guide provides solutions to common problems encountered while developing, deploying, or using the HRPM platform.

---

## Table of Contents

1. [Development Issues](#development-issues)
2. [Build & Deployment Issues](#build--deployment-issues)
3. [Authentication Issues](#authentication-issues)
4. [Database Issues](#database-issues)
5. [API & Edge Function Issues](#api--edge-function-issues)
6. [Frontend Issues](#frontend-issues)
7. [Performance Issues](#performance-issues)
8. [Browser Compatibility](#browser-compatibility)

---

## Development Issues

### Issue: `npm install` Fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Clear npm cache**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use correct Node version**
   ```bash
   nvm use 18
   npm install
   ```

3. **Force install (last resort)**
   ```bash
   npm install --legacy-peer-deps
   ```

### Issue: Dev Server Won't Start

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5173
```

**Solutions:**

1. **Kill process on port 5173**
   ```bash
   # Linux/Mac
   lsof -ti:5173 | xargs kill -9

   # Windows
   netstat -ano | findstr :5173
   taskkill /PID <PID> /F
   ```

2. **Use different port**
   ```bash
   npm run dev -- --port 3000
   ```

### Issue: TypeScript Errors

**Symptoms:**
```
Type 'string' is not assignable to type 'number'
```

**Solutions:**

1. **Restart TypeScript server** (VS Code)
   - Cmd/Ctrl + Shift + P
   - "TypeScript: Restart TS Server"

2. **Check types**
   ```bash
   npx tsc --noEmit
   ```

3. **Update types**
   ```bash
   npm install @types/react@latest @types/react-dom@latest
   ```

### Issue: Import Path Not Resolved

**Symptoms:**
```
Cannot find module '@/components/...'
```

**Solutions:**

1. **Check tsconfig.json paths**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. **Restart dev server**
   ```bash
   npm run dev
   ```

---

## Build & Deployment Issues

### Issue: Build Fails

**Symptoms:**
```
ERROR: Build failed with 1 error
```

**Solutions:**

1. **Check for TypeScript errors**
   ```bash
   npx tsc --noEmit
   ```

2. **Clear build cache**
   ```bash
   rm -rf dist .vite
   npm run build
   ```

3. **Check for circular dependencies**
   ```bash
   npx madge --circular src/
   ```

4. **Increase Node memory**
   ```bash
   NODE_OPTIONS=--max_old_space_size=4096 npm run build
   ```

### Issue: Build Size Too Large

**Symptoms:**
- Slow page loads
- Large bundle warnings

**Solutions:**

1. **Analyze bundle**
   ```bash
   npm run build -- --mode analyze
   ```

2. **Lazy load routes**
   ```tsx
   const AdminPage = lazy(() => import("./pages/Admin"));
   ```

3. **Optimize images**
   - Use WebP format
   - Compress images
   - Use responsive images

4. **Review dependencies**
   - Remove unused packages
   - Use lighter alternatives

### Issue: Deployment Fails

**Symptoms:**
- Build succeeds locally but fails on Lovable
- Changes not reflected after deployment

**Solutions:**

1. **Clear Lovable cache**
   - Click "Clear Cache" in Lovable dashboard
   - Rebuild

2. **Check environment variables**
   - Verify .env file exists
   - Check variable names (VITE_ prefix)

3. **Manual redeploy**
   - Click "Publish" → "Update"
   - Wait for build completion

4. **Check build logs**
   - Review Lovable deployment logs
   - Look for specific error messages

---

## Authentication Issues

### Issue: Can't Sign In

**Symptoms:**
- "Invalid login credentials" error
- Infinite loading on sign in

**Solutions:**

1. **Check email confirmation**
   - Look for confirmation email
   - Click confirmation link

2. **Verify Supabase connection**
   ```typescript
   // Check if client is initialized
   console.log(supabase.auth);
   ```

3. **Check environment variables**
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_PUBLISHABLE_KEY=...
   ```

4. **Clear browser data**
   - Clear localStorage
   - Clear cookies
   - Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Issue: Session Expires Immediately

**Symptoms:**
- Signed out after refresh
- "Session not found" errors

**Solutions:**

1. **Check token expiration**
   - Default: 1 hour
   - Configure in Supabase Dashboard: Authentication → Settings

2. **Verify AuthContext**
   ```tsx
   // Make sure AuthProvider wraps app
   <AuthProvider>
     <App />
   </AuthProvider>
   ```

3. **Check for conflicting logout logic**
   - Search for `signOut()` calls
   - Remove auto-logout code

### Issue: 401 Unauthorized Errors

**Symptoms:**
```
{
  "error": "JWT expired"
}
```

**Solutions:**

1. **Refresh token**
   ```typescript
   const { data, error } = await supabase.auth.refreshSession();
   ```

2. **Re-authenticate**
   ```typescript
   await supabase.auth.signOut();
   // Sign in again
   ```

3. **Check RLS policies**
   - Verify user has permissions
   - Test with different roles

---

## Database Issues

### Issue: Query Returns No Data

**Symptoms:**
- Expected data not returned
- Empty arrays/null results

**Solutions:**

1. **Check RLS policies**
   ```sql
   -- View policies for table
   SELECT * FROM pg_policies WHERE tablename = 'cases';
   ```

2. **Test query directly**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM cases;
   ```

3. **Verify data exists**
   - Check Supabase Dashboard → Table Editor
   - Confirm records exist

4. **Check query filters**
   ```typescript
   // Remove filters to test
   const { data } = await supabase
     .from("cases")
     .select("*");
   // .eq("id", caseId);  // Comment out filters
   ```

### Issue: Insert/Update Fails

**Symptoms:**
```
{
  "error": "new row violates row-level security policy"
}
```

**Solutions:**

1. **Check RLS policies**
   ```sql
   -- View INSERT policies
   SELECT * FROM pg_policies 
   WHERE tablename = 'cases' 
   AND cmd = 'INSERT';
   ```

2. **Verify authentication**
   ```typescript
   const { data: { session } } = await supabase.auth.getSession();
   console.log("User:", session?.user);
   ```

3. **Check required fields**
   ```sql
   -- View NOT NULL constraints
   SELECT column_name, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'cases';
   ```

4. **Test with admin user**
   - Sign in as admin
   - Retry operation

### Issue: Foreign Key Constraint Violation

**Symptoms:**
```
{
  "error": "insert or update on table violates foreign key constraint"
}
```

**Solutions:**

1. **Verify related record exists**
   ```typescript
   // Check if case exists before inserting event
   const { data: case } = await supabase
     .from("cases")
     .select("id")
     .eq("id", caseId)
     .single();

   if (!case) {
     console.error("Case not found");
     return;
   }
   ```

2. **Use cascading deletes**
   ```sql
   ALTER TABLE extracted_events
   ADD CONSTRAINT fk_case
   FOREIGN KEY (case_id)
   REFERENCES cases(id)
   ON DELETE CASCADE;
   ```

---

## API & Edge Function Issues

### Issue: Edge Function Returns 500 Error

**Symptoms:**
```
{
  "error": "Internal Server Error"
}
```

**Solutions:**

1. **Check function logs**
   - Supabase Dashboard → Edge Functions → Logs
   - Look for error messages

2. **Test locally**
   ```bash
   supabase functions serve function-name
   curl -X POST http://localhost:54321/functions/v1/function-name
   ```

3. **Check for unhandled errors**
   ```typescript
   try {
     // Function code
   } catch (error) {
     console.error("Error:", error);
     return new Response(
       JSON.stringify({ error: error.message }),
       { status: 500 }
     );
   }
   ```

### Issue: Edge Function Timeout

**Symptoms:**
```
{
  "error": "Function execution timed out"
}
```

**Solutions:**

1. **Optimize function code**
   - Reduce AI prompt size
   - Batch database operations
   - Add caching

2. **Increase timeout** (Supabase Dashboard)
   - Settings → Edge Functions
   - Adjust timeout limit

3. **Break into smaller functions**
   - Split long operations
   - Use async processing

### Issue: CORS Error

**Symptoms:**
```
Access to fetch blocked by CORS policy
```

**Solutions:**

1. **Check Edge Function CORS headers**
   ```typescript
   return new Response(JSON.stringify(data), {
     headers: {
       "Content-Type": "application/json",
       "Access-Control-Allow-Origin": "*",
       "Access-Control-Allow-Headers": "authorization, content-type",
     },
   });
   ```

2. **Verify request origin**
   - Check if request from correct domain
   - Update allowed origins if needed

---

## Frontend Issues

### Issue: Component Not Rendering

**Symptoms:**
- Blank page
- Component missing from DOM

**Solutions:**

1. **Check browser console**
   - Look for JavaScript errors
   - Check for network errors

2. **Add error boundary**
   ```tsx
   <ErrorBoundary fallback={<div>Error occurred</div>}>
     <YourComponent />
   </ErrorBoundary>
   ```

3. **Check conditional rendering**
   ```tsx
   // Make sure conditions are met
   {isLoading && <Spinner />}
   {!isLoading && data && <Content data={data} />}
   ```

4. **Verify imports**
   ```tsx
   // Check import path
   import { Component } from "@/components/Component";
   ```

### Issue: State Not Updating

**Symptoms:**
- UI doesn't reflect state changes
- Stale data displayed

**Solutions:**

1. **Check React Query cache**
   ```typescript
   // Force refetch
   queryClient.invalidateQueries({ queryKey: ["cases"] });
   ```

2. **Use functional setState**
   ```tsx
   // ✅ Good
   setState(prev => prev + 1);

   // ❌ Bad (closure issue)
   setState(state + 1);
   ```

3. **Check for mutation**
   ```tsx
   // ✅ Good - Create new object
   setUser({ ...user, name: "New Name" });

   // ❌ Bad - Mutating state
   user.name = "New Name";
   setUser(user);
   ```

### Issue: Infinite Re-renders

**Symptoms:**
```
Maximum update depth exceeded
```

**Solutions:**

1. **Check useEffect dependencies**
   ```tsx
   // ✅ Good
   useEffect(() => {
     fetchData();
   }, [id]);  // Only re-run when id changes

   // ❌ Bad
   useEffect(() => {
     fetchData();
   });  // Re-runs on every render
   ```

2. **Avoid state updates in render**
   ```tsx
   // ❌ Bad
   function Component() {
     setState(newValue);  // Causes infinite loop
     return <div>...</div>;
   }

   // ✅ Good
   function Component() {
     useEffect(() => {
       setState(newValue);
     }, []);
     return <div>...</div>;
   }
   ```

---

## Performance Issues

### Issue: Slow Page Load

**Solutions:**

1. **Lazy load components**
   ```tsx
   const HeavyComponent = lazy(() => import("./HeavyComponent"));
   ```

2. **Optimize images**
   - Use WebP format
   - Add lazy loading
   - Use appropriate sizes

3. **Reduce bundle size**
   - Code split by route
   - Remove unused dependencies
   - Use dynamic imports

4. **Enable caching**
   - Configure React Query staleTime
   - Use service workers (future)

### Issue: Slow Database Queries

**Solutions:**

1. **Add indexes**
   ```sql
   CREATE INDEX idx_events_date ON extracted_events(date);
   ```

2. **Optimize queries**
   - Select only needed columns
   - Use pagination
   - Avoid N+1 queries

3. **Use database functions**
   ```sql
   -- Instead of multiple queries
   CREATE FUNCTION get_case_with_events(case_id UUID)
   RETURNS TABLE(...) AS $$
     -- Combined query
   $$ LANGUAGE sql;
   ```

---

## Browser Compatibility

### Supported Browsers

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### Common Browser Issues

**Issue: Features not working in Safari**

Solutions:
- Check for unsupported CSS features
- Add webkit prefixes
- Test on actual Safari browser

**Issue: WebSocket errors in Firefox**

Solutions:
- Check for mixed content (HTTP/HTTPS)
- Verify WSS protocol
- Check browser console for specifics

---

## Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Search existing GitHub issues
3. ✅ Check browser console for errors
4. ✅ Review relevant documentation
5. ✅ Try to reproduce in clean environment

### How to Ask for Help

**Include:**
- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/error messages
- Environment (OS, browser, Node version)
- Relevant code snippets

**Example:**

```
**Issue:** Can't create new case

**Steps to reproduce:**
1. Navigate to /cases
2. Click "New Case"
3. Fill form
4. Click "Create"

**Expected:** Case should be created and appear in list

**Actual:** Error message "Failed to create case"

**Error in console:**
{
  "error": "new row violates row-level security policy"
}

**Environment:**
- OS: macOS 13
- Browser: Chrome 120
- Node: 18.17.0
```

### Support Channels

- GitHub Issues: Bug reports and feature requests
- Documentation: [/docs](/docs)
- Email: support@hrpm.org

---

*This troubleshooting guide is continuously updated. If you encounter an issue not covered here, please report it.*
