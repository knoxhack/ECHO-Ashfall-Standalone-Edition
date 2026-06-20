#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(repoRoot, "release-manifest.template.json");
const manifest = readJson(manifestPath);

const releaseTag = requiredText(manifest.releaseTag, "releaseTag");
const manifestAsset = requiredText(manifest.manifestAsset, "manifestAsset");
const artifactName = requiredText(manifest.artifactName, "artifactName");
const releaseDir = path.join(repoRoot, "release-assets", releaseTag);
const stagingDir = path.join(repoRoot, "tmp", "rebuild-official-modpack-assets", manifest.pack);
const fixedZipTimestamp = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
  : "2026-06-20T00:00:00Z";
const generatedAt = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
  : "2026-06-20T00:00:00.000Z";
const artifactPath = path.join(releaseDir, artifactName);

fs.mkdirSync(releaseDir, { recursive: true });
if (!fs.existsSync(artifactPath)) {
  throw new Error(`Cannot seed staging without existing artifact: ${artifactPath}`);
}
fs.rmSync(stagingDir, { recursive: true, force: true });
fs.mkdirSync(stagingDir, { recursive: true });
const extract = spawnSync("jar", [
  "--extract",
  "--file",
  artifactPath
], { cwd: stagingDir, stdio: "inherit" });
if (extract.status !== 0) {
  throw new Error(`jar extract failed with exit code ${extract.status}`);
}
fs.rmSync(path.join(stagingDir, ".echo"), { recursive: true, force: true });
fs.mkdirSync(path.join(stagingDir, ".echo"), { recursive: true });

manifest.generatedBy = "scripts/rebuild-official-modpack-assets";
manifest.updatedAt = generatedAt;

const installedManifest = {
  ...manifest
};
delete installedManifest.artifactSha256;
delete installedManifest.artifactSize;

writeJson(path.join(stagingDir, ".echo", "pack-manifest.json"), installedManifest);
writeJson(path.join(stagingDir, ".echo", "export-report.json"), exportReport(installedManifest, generatedAt));
writeText(path.join(stagingDir, ".echo", "checksums.sha256"), stagingChecksums(stagingDir));

const tmpArtifactPath = artifactPath + ".tmp";
fs.rmSync(tmpArtifactPath, { force: true });
const jar = spawnSync("jar", [
  "--create",
  "--file",
  tmpArtifactPath,
  "--no-manifest",
  `--date=${fixedZipTimestamp}`,
  "-C",
  stagingDir,
  "."
], { stdio: "inherit" });
if (jar.status !== 0) {
  throw new Error(`jar failed with exit code ${jar.status}`);
}
fs.renameSync(tmpArtifactPath, artifactPath);

const artifactStats = fileStats(artifactPath);
manifest.artifactSha256 = artifactStats.sha256;
manifest.artifactSize = artifactStats.size;
writeJson(manifestPath, manifest);
writeJson(path.join(releaseDir, manifestAsset), manifest);
const updatedManifestStats = fileStats(path.join(releaseDir, manifestAsset));
const releaseAudit = auditReport(manifest, generatedAt, artifactStats, updatedManifestStats);
const echoRelease = releaseReport(manifest, generatedAt, artifactStats, updatedManifestStats);
writeJson(path.join(releaseDir, "release-audit.json"), releaseAudit);
writeJson(path.join(releaseDir, "echo-release.json"), echoRelease);
writeText(path.join(releaseDir, "checksums.txt"), releaseChecksums(releaseDir, [
  artifactName,
  manifestAsset,
  "echo-release.json",
  "release-audit.json"
]));

console.log(JSON.stringify({
  releaseTag,
  manifestAsset,
  manifestSha256: updatedManifestStats.sha256,
  artifactName,
  artifactSha256: artifactStats.sha256,
  artifactSize: artifactStats.size
}, null, 2));

function exportReport(value, timestamp) {
  return {
    schemaVersion: "echo.official_modpack.export_report.v1",
    status: "rebuilt",
    pack: value.pack,
    name: value.name,
    channel: value.channel,
    version: value.version,
    runtimeTarget: value.runtimeTarget,
    moduleArtifactFamily: "standalone",
    moduleRelease: value.moduleRelease,
    moduleCount: Array.isArray(value.modules) ? value.modules.length : 0,
    generatedAt: timestamp,
    sourceRepo: "knoxhack/ECHO-Ashfall-Standalone-Edition",
    releaseTag: value.releaseTag
  };
}

function auditReport(value, timestamp, artifactStats, manifestStats) {
  return {
    schemaVersion: "echo.official_modpack.release_audit.v1",
    status: "rebuilt-from-current-module-catalog",
    pack: value.pack,
    name: value.name,
    version: value.version,
    channel: value.channel,
    moduleRelease: value.moduleRelease,
    moduleSourceRevision: value.moduleSourceRevision,
    releaseTag: value.releaseTag,
    sourceRepo: "knoxhack/ECHO-Ashfall-Standalone-Edition",
    moduleCount: Array.isArray(value.modules) ? value.modules.length : 0,
    artifact: {
      name: value.artifactName,
      sha256: artifactStats.sha256,
      size: artifactStats.size
    },
    manifest: {
      name: value.manifestAsset,
      sha256: manifestStats.sha256,
      size: manifestStats.size
    },
    generatedAt: timestamp
  };
}

function releaseReport(value, timestamp, artifactStats, manifestStats) {
  const moduleAssets = (Array.isArray(value.files) ? value.files : []).map(row => ({
    name: row.assetName || row.artifactName,
    role: "pack-file",
    path: row.path,
    sha256: row.sha256,
    size: row.size
  }));
  return {
    formatVersion: 2,
    pack: value.pack,
    name: value.name,
    version: value.version,
    channel: value.channel,
    releasedAt: timestamp,
    manifestAsset: value.manifestAsset,
    manifestSha256: manifestStats.sha256,
    manifestSize: manifestStats.size,
    artifactMode: value.artifactMode,
    artifactAsset: value.artifactName,
    artifactSha256: artifactStats.sha256,
    artifactSize: artifactStats.size,
    moduleRelease: value.moduleRelease,
    packs: [{
      pack: value.pack,
      name: value.name,
      version: value.version,
      channel: value.channel,
      manifestAsset: value.manifestAsset,
      artifactAsset: value.artifactName
    }],
    assets: [
      {
        name: value.manifestAsset,
        role: "pack-manifest",
        sha256: manifestStats.sha256,
        size: manifestStats.size
      },
      {
        name: value.artifactName,
        role: "pack-artifact",
        sha256: artifactStats.sha256,
        size: artifactStats.size
      },
      ...moduleAssets
    ],
    notes: [
      "Ashfall Standalone Edition refreshed against the current Release Index module catalog.",
      "Pack module files, sidecar metadata, and archive checksums are pinned to current GitHub module artifacts."
    ],
    moduleSourceRevision: value.moduleSourceRevision
  };
}

function stagingChecksums(root) {
  const entries = [
    ".echo/export-report.json",
    ".echo/pack-manifest.json",
    ...(Array.isArray(manifest.files) ? manifest.files.map(row => row.path).filter(Boolean) : [])
  ].sort();
  return entries.map(entry => `${sha256(path.join(root, entry))}  ${entry.replaceAll("\\", "/")}`).join("\n") + "\n";
}

function releaseChecksums(root, names) {
  return names.map(name => `${sha256(path.join(root, name))}  ${name}`).join("\n") + "\n";
}

function fileStats(file) {
  return {
    sha256: sha256(file),
    size: fs.statSync(file).size
  };
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(file, value) {
  writeText(file, JSON.stringify(value, null, 2) + "\n");
}

function writeText(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, "utf8");
}

function requiredText(value, field) {
  const text = String(value || "").trim();
  if (!text) {
    throw new Error(`release manifest missing ${field}`);
  }
  return text;
}
