# Taskfile Dependency Graph

```mermaid
flowchart TD
  reindex["reindex"]
  check["check"]
  fmt["fmt"]
  fmtCheck["fmt:check"]
  build["build"]
  publishDryRun["publish:dry-run"]
  publish["publish"]

  check --> build
  build -> publish
  build -> publishDryRun
```
