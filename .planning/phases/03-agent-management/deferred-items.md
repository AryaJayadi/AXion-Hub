# Deferred Items - Phase 03

## Pre-existing Type Errors

### agent-memory-browser.tsx MDEditor onChange prop
- **File:** `src/features/agents/components/agent-memory-browser.tsx:178`
- **Issue:** MDEditor `onChange` prop type incompatible with `exactOptionalPropertyTypes`. The `onChange` callback is conditionally undefined when `isReadOnly` is true, but MDEditorProps requires a function type.
- **Origin:** Plan 03-05 (Memory Browser)
- **Fix:** Wrap onChange in conditional prop spreading: `{...(onChange ? { onChange } : {})}` pattern (same pattern used for Slider in 03-02)
- **Impact:** Does not block build (Next.js Turbopack TypeScript check passes). Only visible via direct `tsc --noEmit`.
