# Ashfall Standalone Edition Rollback

Rollback is managed by the launcher before replacing verified files.

## Rollback Inputs

- Previous installed manifest
- Previous managed file hashes
- Downloaded replacement manifest
- Failed artifact path, hash, or validation error

If a module update fails validation, the launcher restores the prior module artifact and leaves unrelated modules untouched.
