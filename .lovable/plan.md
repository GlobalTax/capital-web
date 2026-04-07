

## Plan: Fix npm ci Build Error (package-lock.json out of sync)

### Problem

The build fails at "Install dependencies" because `package-lock.json` is out of sync with `package.json`. Specifically, `flatted@3.3.1` in the lock file doesn't match the required `flatted@3.4.2`.

### Solution

Regenerate `package-lock.json` by running `npm install`. This will update the lock file to match current `package.json` dependencies.

### Steps

1. **Delete `package-lock.json`** and regenerate it with `npm install`
2. **Verify** the build succeeds

This is a one-step fix — no code changes needed, just a lock file refresh.

