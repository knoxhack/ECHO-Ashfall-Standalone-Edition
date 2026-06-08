# Ashfall Standalone Edition Install

Ashfall Standalone Edition is installed by ECHO Launcher from verified GitHub Release metadata.

## Module Artifact Type

This edition consumes `<module>-<version>-standalone.jar` module artifacts from `knoxhack/ECHO-Modules`.

## Install Flow

1. The launcher reads the release index.
2. The selected channel points to this repo's release metadata.
3. The launcher downloads and verifies the pack manifest.
4. The launcher resolves module requirements for the `standalone` family.
5. Only verified pack files and module artifacts are installed.
