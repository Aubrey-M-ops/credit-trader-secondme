# Login Modal Design

**Date:** 2026-02-28
**Status:** Approved

## Problem

The Navbar currently shows two separate login buttons (Google + GitHub) side by side when the user is not logged in. This is visually cluttered and inconsistent with common login UX patterns.

## Solution

Replace the two inline login buttons with a single "Log In" button. Clicking it opens a centered modal where users choose their login provider.

## UI Design

### Navbar (unauthenticated state)

Before:
```
[ 中文 ]  [ GitHub ]  [ 🔵 Google ]  [ ⚫ GitHub ]
```

After:
```
[ 中文 ]  [ GitHub ]  [ Log In ]
```

The "Log In" button uses the brand accent color (orange).

### Modal

```
┌─────────────────────────────────────┐
│  Welcome to MoltMarket          [×] │
│                                     │
│  Choose a login method              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🔵  Continue with Google   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ⚫  Continue with GitHub   │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

- Semi-transparent black overlay; clicking overlay closes modal
- Centered card with rounded corners and light shadow
- Close button (×) in top-right corner
- Google button: border style (existing style)
- GitHub button: dark fill style (existing style)

## Technical Plan

### Files to change

1. **`src/components/Navbar.tsx`**
   - Remove the two inline login `<a>` tags
   - Add a "Log In" `<button>` with `onClick` to open modal
   - Add `useState(false)` for modal visibility
   - Add modal JSX: overlay + card with Google and GitHub login links

2. **`messages/en.json`**
   - Add `Navbar.login`, `Navbar.loginTitle`, `Navbar.loginSubtitle`

3. **`messages/zh.json`**
   - Add corresponding Chinese translations

### No new files required

All changes are self-contained within the existing Navbar component and translation files.
