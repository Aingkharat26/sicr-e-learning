---
name: "sic-update"
description: "Update an existing project's sic-ng install to the latest released version — checks the currently installed version against the latest git tag, and if newer, reinstalls from the private repo pinned to that tag. Use when the user asks to update, upgrade, or bump sic-ng to the latest version."
---

# sic-update — Update sic-ng to the latest version

Run this in a project that already has `sic-ng` installed (see `sic-project-setup` if it isn't installed yet at all).

## Step 1 — Find the currently installed version

Read the installed package's version, don't guess from `package.json`'s dependency range (it may be pinned to a git ref, not a semver range):

```
node -e "console.log(require('./node_modules/sic-ng/package.json').version)"
```

## Step 2 — Find the latest available version

```
git ls-remote --tags --refs https://github.com/softinter-chiangrai/sic-ng.git
```

Tags follow `vMAJOR.MINOR.PATCH` — pick the highest by semver, not just the last line of output.

## Step 3 — Compare

- **If the installed version already matches the latest tag** (strip the `v` prefix before comparing): tell the user they're already on the latest version and stop here.
- **If older**: continue to Step 4. Mention the version jump (e.g. `22.1.1 → 22.1.2`) so the user knows the scope before proceeding.

## Step 4 — Reinstall pinned to the latest tag

Same private-repo install pattern as initial setup, authenticating with a GitHub personal access token from the `GITHUB_TOKEN` environment variable — **never write a real token as a literal string in a command, a file, or anywhere that could be committed to git.** If `GITHUB_TOKEN` isn't already set in the environment, ask the user for their token and have them export it themselves (or enter it interactively) rather than typing it into chat/a file for you to paste back in.

```
npm install "git+https://${GITHUB_TOKEN}@github.com/softinter-chiangrai/sic-ng.git#<latest-tag>"
```

Replace `<latest-tag>` with the tag found in Step 2, e.g. `v22.1.2`.

## Step 5 — Verify

- Re-run the Step 1 command to confirm `node_modules/sic-ng/package.json`'s version now matches the latest tag.
- Run the project's normal build (e.g. `ng build` or `npm run build`) to catch any breaking changes early — a version bump across multiple minor/major releases can include API changes.
- If the build fails, don't guess at fixes blindly: check the failing import/usage against the `sic-ng` skill's reference files (`references/<group>.md`) for the current shape of that API, since it may have changed between the old and new version.

## Related skills

- `sic-project-setup` — initial install into a brand-new project (this skill assumes sic-ng is already installed).
- `sic-ng` — component reference, useful for checking whether an API changed after updating.
