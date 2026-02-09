

## Fix: Hero content not vertically centered (empty space below)

### Problem

The previous change replaced `h-screen` with `min-h-dvh`. However, the content div uses `h-full flex justify-center` which requires a **definite height** on the parent. `min-height` does not provide a definite height, so `h-full` collapses and `justify-center` has no effect — the content stacks at the top with a large empty gap below.

### Solution

Two small changes in `src/components/Hero.tsx`:

1. **Line 159**: Add `flex flex-col` to the `<section>` so it becomes a flex container
2. **Line 209**: Change content div from `h-full flex flex-col justify-center` to `flex-1 flex flex-col justify-center` — using `flex-1` instead of `h-full` so it stretches within the flex parent

This keeps `min-h-dvh` for the mobile viewport fix while properly centering the content.

### Changes

| Line | Before | After |
|------|--------|-------|
| 159 | `relative min-h-dvh overflow-hidden` | `relative min-h-dvh overflow-hidden flex flex-col` |
| 209 | `relative z-10 h-full flex flex-col justify-center` | `relative z-10 flex-1 flex flex-col justify-center` |

### File affected

- `src/components/Hero.tsx`

