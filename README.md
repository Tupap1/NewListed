# NewListed

Invoice and tax-document processor: ingests Excel/XML invoice data and handles Colombian electronic-invoicing (DIAN-style XML) tax logic, containerized for deployment.

## Stack
- **Node.js backend + frontend**, split into `backend/` and `frontend/`
- **Docker Compose** for local orchestration, deployable to **Railway** (`railway.toml`)
- Real production incident history documented and fixed in place (`CRITICAL_FIX_TAX_PER_ITEM.md`) — per-item tax calculation bug caught and resolved, not just patched blind

## Why it's interesting
Tax-per-item calculation on invoices is a classic "looks simple, isn't" problem (rounding, per-line vs per-invoice tax, partial credits). The fix history in this repo documents the actual bug and resolution.
