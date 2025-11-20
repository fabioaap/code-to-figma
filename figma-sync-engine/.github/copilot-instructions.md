# Copilot Instructions

## Architecture Snapshot
- Monorepo managed with PNPM + Turbo (`pnpm-workspace.yaml`, `turbo.json`) and a Clean Architecture split: Domain (conversion heuristics) → Application (pipeline orchestration) → Infrastructure (storybook/plugin integrations) → Interface (addon UI + Figma plugin); see `docs/architecture.md`.
- Core flow: Storybook addon captures sanitized HTML (`packages/storybook-addon-export/src/captureHtml.ts`) → `@figma-sync-engine/html-to-figma-core` wraps `@builder.io/html-to-figma` for base JSON → `@figma-sync-engine/autolayout-interpreter` annotates Auto Layout → Figma plugin (`packages/figma-plugin-lite`) rebuilds nodes.

## Key Packages & Responsibilities
- `packages/storybook-addon-export`: Panel (`panel.tsx`) emits `EVENT_EXPORT_REQUEST`, uses strict tag/attribute whitelist in `captureHtml.ts`; whitelist updates are required whenever new HTML primitives must pass through.
- `packages/html-to-figma-core`: currently re-exports Builder.io and exposes `convertHtmlToFigma`; extend here when introducing hooks (e.g., variant mapping, token injection) to keep the rest of the pipeline untouched.
- `packages/autolayout-interpreter`: `applyAutoLayout` expects a `FigmaNode` plus CSS snapshot and mutates layout props; padding normalization lives here so tests (`tests/interpret.test.ts`) should be updated whenever heuristics change.
- `packages/figma-plugin-lite`: `code.ts` trusts the JSON schema in `docs/figma-json-format.md`; when adding new node types make sure to update both plugin creation logic and the UI form (`ui.tsx`).
- `examples/react-button`: canonical sanity test for the exporter; tweak stories here when needing reproducible snapshots.

## Dev Workflow
- Install/build/test from repo root via `pnpm install`, `pnpm build`, `pnpm test`, `pnpm lint`; each script fans out through Turbo, so breakages usually indicate a failing package step.
- Use `pnpm --filter <package> <script>` for focused work (e.g., `pnpm --filter @figma-sync-engine/autolayout-interpreter test`).
- Storybook interactions rely on the prebuilt example inside `examples/react-button/storybook-static`; regenerate via Storybook CLI if changes are made.

## Testing & QA
- Prefer Vitest for unit coverage; snapshot or regression tests for converter output should live near the producing package (e.g., addon or html-to-figma-core) to keep Turbo caching effective.
- Auto Layout heuristics must stay synced with documentation in `docs/autolayout-engine.md`; whenever you add CSS → Figma mapping, add a table row + unit test case.
- Plugin smoke tests are manual today: run `pnpm --filter @figma-sync-engine/figma-plugin-lite build`, load the manifest in Figma Desktop, and paste JSON exported from the addon.

## Conventions & Guardrails
- TypeScript everywhere with ESM modules; reuse the shared config in `tsconfig.base.json` instead of ad-hoc compiler tweaks.
- JSON schema changes require updating `docs/figma-json-format.md` plus the plugin importer; keep `version` bumping consistent.
- Follow the automation policy in `docs/automation-policy.md`: commands like `pnpm install/build/lint/test/dev` and `git status/diff` are pre-approved, destructive commands need explicit user confirmation.
- Security posture: exporter sanitizes HTML aggressively; never loosen the whitelist without adding reasoning + tests because the addon runs inside end-user Storybooks.

## Useful References
- `docs/action-plan.md` lists the MVP roadmap, feature flags (kill-switch envs), and logging expectations—align new work with those milestones.
- `docs/plan.md`, `docs/backlog.md`, and `docs/figma-json-format.md` capture requirements/format decisions; cite them when introducing changes so future agents can trace the "why" quickly.
