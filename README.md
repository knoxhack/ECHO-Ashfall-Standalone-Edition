# ECHO Ashfall Standalone Edition

Canonical release-feed repository for Ashfall Standalone Edition.

This repo owns the player-facing standalone release stream consumed by ECHO Launcher. Release assets should include the pack manifest/checksums and standalone module artifacts from `knoxhack/ECHO-Modules`.

Expected per-module artifact family:

- `<module>-<version>-standalone.jar`
- `<module>-<version>-sources.jar`
- `META-INF/echo.mod.json`
- `echo-addon-package.json` when the module is also packaged as an ECHO addon

Launcher identity:

- Pack id: `ashfall-standalone-edition`
- Display name: `Ashfall Standalone Edition`
- Release feed: `knoxhack/ECHO-Ashfall-Standalone-Edition`
- Module artifact family: `standalone`

Keep this repo private until the first real release assets are ready for players.
