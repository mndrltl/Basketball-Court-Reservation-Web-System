# Backend server

Install the backend dependencies from this directory:

```bash
bun install
```

The backend reads configuration from the workspace-root `.env` regardless of
whether it is started from the repository root or this directory. Merge the
settings in this directory's `.env.example` into that root file, and set
`JWT_SECRET` to a long, random value. Do not commit the secret. MongoDB must be
running at the `MONGODB_URI` address; all backend operations target
`basketball_reservation`.

Start the API in development mode:

```bash
bun run dev
```

The API listens on `http://localhost:5000` by default. Check its health at
`http://localhost:5000/api/health`. The frontend origin defaults to
`http://localhost:3000`; set `CLIENT_ORIGIN` in the root `.env` if it differs.

Authentication is provided by `/api/auth/register`, `/api/auth/login`,
`/api/auth/me`, and `/api/auth/logout`. Sessions use an HTTP-only cookie.

For a non-watch start:

```bash
bun run start
```

Type-check the backend:

```bash
bun run typecheck
```

The explicit database configuration and seed scripts are available as
`bun run db:setup` and `bun run db:seed`. The seed script inserts sample records
only when they do not already exist; it does not overwrite existing records.

To set a password for an administrator that is already explicitly marked as an
administrator in `basketball_reservation`, provide that account's email and
staff ID together with a private password, then run `bun run admin:provision`
from this directory. For PowerShell, enter the password without echoing it:

```powershell
$env:ADMIN_PROVISION_EMAIL = Read-Host "Authorized administrator email"
$env:ADMIN_PROVISION_STAFF_ID = Read-Host "Authorized staff ID"
$securePassword = Read-Host "New administrator password" -AsSecureString
$env:ADMIN_PROVISION_PASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password
bun run admin:provision
Remove-Item Env:ADMIN_PROVISION_EMAIL, Env:ADMIN_PROVISION_STAFF_ID, Env:ADMIN_PROVISION_PASSWORD
Remove-Variable securePassword
```

The script does not create accounts, promote users, overwrite existing
password credentials, or run automatically. It requires the target account to
already have `isAdmin: true` and an administrator/director role, hashes the
password with bcrypt, and updates only that account. Sign in through the normal
login page; the verified backend role opens the administrator dashboard.

[Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
