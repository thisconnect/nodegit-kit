# Changelog

## v0.14.0

- uses NodeGit 0.17.0
- log now uses RevWalk internally
- **breaking API change** `git.config.get` now rejects when getting non-existent key.

## v0.12.0

- **breaking API change in git.diff**. Changed order of `from` and `to` to be aligned with git-cli. New API `git.diff(repo, from, to)`
https://github.com/thisconnect/nodegit-kit/issues/18
