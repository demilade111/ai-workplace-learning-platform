# AI Workplace Learning Platform

A multi-tenant AI workplace learning and knowledge platform. Departments upload internal company knowledge, AI generates structured employee training from it, managers review and publish, employees complete training and get assessed, and employees can semantically search authorized company knowledge and contribute their own — with a trust workflow (`personal → shared → verified`) governing what becomes official.

## Structure

This is an npm-workspaces monorepo:

- `backend/` — API server (Node.js, Express, TypeScript)
- `frontend/` — web app (React, Vite, TypeScript)
- `worker/` — background worker (document/knowledge processing, embeddings, AI generation)
- `packages/shared/` — types and schemas shared between `backend` and `worker`

## Development

Documented as each piece is built — see [4-project-2-curriculum.md](../4-project-2-curriculum.md) in the parent workspace for the full sprint/ticket plan.
