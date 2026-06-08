# Ashfall Standalone Edition Update Flow

Ashfall Standalone Edition supports file-level and module-level updates through ECHO Launcher.

## Flow

1. Fetch the current release metadata for `knoxhack/ECHO-Ashfall-Standalone-Edition`.
2. Compare the installed manifest to the latest channel manifest.
3. Expand `moduleRequirements` into individual module files.
4. Resolve each module from `knoxhack/ECHO-Modules`.
5. Download only changed or missing files.
6. Verify SHA-256 and size before activation.
7. Keep rollback metadata for every replaced managed file.
