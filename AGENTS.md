# Automatic Git Version Control Rule for Ledgera

This project enforces **continuous, automated Git version control** for all development tasks performed by Antigravity.

---

## 1. Automatic Staging and Committing
- **Mandatory on Task Completion**: Whenever Antigravity completes a code modification, feature implementation, refactoring, or bug fix, it MUST automatically stage the modified files and create a Git commit.
- **No Manual Prompting Needed**: Never ask the user whether to stage or commit; perform the commit automatically at the end of the task.

---

## 2. Pre-Commit Verification
Before creating a commit:
1. Run `git status` to inspect all modified and untracked files.
2. Confirm that every staged file is directly related to the task just completed.
3. Verify that the application compiles / passes syntax checks (e.g., `pnpm run build:frontend`).

---

## 3. Strict Exclusions (Safety & Cleanliness)
Never commit:
- Build artifacts or distribution folders (`dist/`, `build/`, `out/`).
- Package dependencies (`node_modules/`, `.pnpm-store/`).
- Binary databases and journals (`*.db`, `*.db-wal`, `*.db-shm`, `*.sqlite`, `*.bak`).
- Environment variables or secrets (`.env`, `.env.*`, certificates, private keys).
- System or temporary files (`*.log`, `*.tmp`, `Thumbs.db`, `.DS_Store`).

Always respect the repository `.gitignore`.

---

## 4. Local Commits Only (Never Auto-Push)
- All commits MUST remain local.
- **NEVER** run `git push` or push changes to GitHub or any remote repository automatically. Pushing is only permitted if the user explicitly requests it in plain text.

---

## 5. Granular Commit History & Conventional Commit Format
- Every individual task or logical milestone must have its own separate Git commit.
- Commit messages must follow conventional commits:
  - `feat: <concise summary>` for new features or UI additions.
  - `fix: <concise summary>` for bug fixes and corrections.
  - `refactor: <concise summary>` for structure/component refactoring.
  - `style: <concise summary>` for UI/UX styling updates.
  - `chore: <concise summary>` for configuration or tooling adjustments.
- Include bullet points describing the specific changes when multiple files are affected.
