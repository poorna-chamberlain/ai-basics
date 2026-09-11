---
type: system-folder
purpose: scratch-space
---

# Temp

Never dump files directly here. Always create a task-scoped subfolder:

temp/<YYYY-MM-DD>_<short-task-slug>/

## Rules

- One subfolder per task/session.
- At session end: promote useful outputs to their permanent location,
  then archive or delete the task subfolder.
- This folder is git-ignored (see root .gitignore) except for this README.
