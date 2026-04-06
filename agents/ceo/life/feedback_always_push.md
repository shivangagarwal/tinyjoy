---
name: always-push-after-commits
description: Always git push after committing work — stale deployments cause visible bugs on live site
type: feedback
---

Always `git push` to origin after completing work that includes commits.

**Why:** On 2026-03-21, 5 commits sat unpushed on main for days. Vercel deploys from GitHub, so the live site was missing blog pages (404), about page, footer nav links, and still showed a huge empty gap on the homepage. Board flagged it as "page not looking good" and "blog pages missing."

**How to apply:** After any task that produces git commits, verify they're pushed before marking the task done. This applies to all agents — PM and CMO were committing but not pushing either. Add a push step to the ship workflow.
