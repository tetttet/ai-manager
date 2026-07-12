<!-- BEGIN:nextjs-agent-rules -->

# Next.js Development Rules

Write clean, production-ready, modular code.

Do not put an entire feature in one file. Split UI, business logic, types, validation, API calls, database logic, hooks, constants, and utilities into appropriate files.

Before creating new code, inspect the project and reuse existing components, types, functions, and patterns.

Avoid duplication. Keep one source of truth for shared logic, types, constants, and validation.

Use Server Components by default. Add `"use client"` only when necessary and keep client components small.

Keep components, functions, and files focused on one responsibility. Do not over-engineer or create unnecessary abstractions.

Use strict TypeScript, avoid `any`, validate external data, handle errors, and never expose secrets.

Prefer readable, performant, maintainable code over quick hacks.

After changes, run relevant lint, type checks, tests, and build commands when available. Do not claim checks passed unless they were actually run.

<!-- END:nextjs-agent-rules -->
