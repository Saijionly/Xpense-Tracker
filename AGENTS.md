<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Themes

- **Purpose:** Document the project's dark/light theme conventions and pointers for making safe theme-related changes.
- **Key files:** [src/app/globals.css](src/app/globals.css), [src/components/ThemeToggle.tsx](src/components/ThemeToggle.tsx), [src/components/ThemeToggle.tsx](src/components/ThemeToggle.tsx#L1-L200)
- **Design tokens:** Theme values live as CSS custom properties (variables) in `@theme` and the `.light` selector. Variables are prefixed with `--color-ledger-` (e.g. `--color-ledger-bg`, `--color-ledger-gold`). See [src/app/globals.css](src/app/globals.css) for the full list.
- **Runtime behaviour:** The theme is toggled by adding/removing the `light` class on the `html` element. The toggle persists the user's choice in `localStorage` under the `theme` key and falls back to `prefers-color-scheme`.
- **Styling guidance for agents:** Prefer using the CSS variables (e.g. `var(--color-ledger-bg)`) rather than hard-coded colors so changes propagate between themes. When adding components or charts, reference these variables or provide CSS that adapts to the `.light` override.
- **Testing:** Verify both states by toggling the UI (see `ThemeToggle`), testing `localStorage` values, and checking components that rely on `--color-ledger-*` tokens (charts, cards, backgrounds).

If you'd like, I can also add a small `AGENTS_THEMES.md` prompt or a skill that automates checks (e.g., ensure new colors use the token prefix). Suggest next? 
