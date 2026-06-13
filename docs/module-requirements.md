# Ashfall Standalone Edition Module Requirements

The pack manifest declares module requirements instead of hard-coding every module file by hand.

```json
{
  "moduleArtifactFamily": "standalone",
  "moduleRequirements": [
    {
      "id": "echoashfallprotocol",
      "version": "1.0.0",
      "required": true
    }
  ]
}
```

The launcher resolves the default artifact name as `<module>-<version>-standalone.jar`. Individual requirements can override `assetName`, `path`, `sha256`, `size`, `side`, or `artifactFamily`.

## Current Published Asset Blocker

The checked-in `release-assets/v0.1.0-ashfall-standalone-edition/` files mirror the currently published GitHub prerelease assets. That published `.pack.json` snapshot does not include `moduleRequirements`, so Release Index and ECHO Launcher keep this edition warning-gated. Rebuild the `.pack.json` from `release-manifest.template.json`, regenerate checksums, upload the corrected assets, then update Release Index hashes.
