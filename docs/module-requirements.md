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
