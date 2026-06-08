# Ashfall Standalone Edition Troubleshooting

## Module Does Not Update

Check that the pack manifest has a matching `moduleRequirements` entry, that `knoxhack/ECHO-Modules` has the requested version, and that the artifact family is `standalone`.

## Hash Mismatch

Delete the failed download cache and retry. The launcher must not activate files whose SHA-256 does not match release metadata.

## Full Pack Download Instead Of File Update

The launcher falls back to the full pack archive when a changed file has no individual release asset URL.
