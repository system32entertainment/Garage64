# Security Policy

## Reporting a vulnerability

Please **do not** file public GitHub issues for security vulnerabilities.

Email reports to: `security@sys32ent.com` (or open a private security advisory on GitHub).

Include:

- Affected version / commit.
- Steps to reproduce.
- Impact assessment.

You'll get an acknowledgement within 7 days. Fixes for confirmed issues land in a patch release with credit (unless you'd rather stay anonymous).

## Scope

In scope:

- The Garage64 web app (backend + frontend in this repo).
- Pack export logic and asset proxy endpoints.

Out of scope:

- Vulnerabilities in upstream dependencies — report those upstream.
- Issues that require a malicious local user (the dev server is not hardened for shared hosting).
- Generated `.jem` / `.jpm` content — Garage64 is a creator tool; output safety is the user's responsibility.

## Supported versions

Garage64 is a prototype. Only `main` is supported.
