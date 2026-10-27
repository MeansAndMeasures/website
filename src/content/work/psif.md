---
title: PSIF
summary: One Windows command surface for finding and installing software across nine package ecosystems.
published: 2026-10-27
updated: 2026-10-27
status: active
initiative: Package Search and Install Federator
tags:
  - software-tools
  - windows
  - interoperability
  - package-management
---

PSIF—the Package Search and Install Federator—brings software discovery and
installation together through a Windows command-line utility named `pkg`.
It searches Winget, GitHub, Chocolatey, PowerShell Gallery, Scoop, NuGet tools,
Docker Hub, Microsoft Store, and Visual Studio Marketplace.

Search results identify their source and provide a distinct installation key.
Positive search terms are combined and ranked; exclusions remove unwanted
matches. An installation preview shows the intended operation before it runs.
Canonical identifiers such as `github:keycloak/keycloak` remain usable without
depending on the most recent search's display keys.

PSIF delegates to the appropriate ecosystem's tooling. GitHub projects can use a
suitable Windows release asset or a repository clone. The tool preserves the
distinctions between installing an application, pulling a container, adding an
editor extension, and obtaining source code.

## Implementation and verification

The implementation is written in Go with the standard library and builds as a
single Windows x64 console executable. Automated checks cover query matching,
ranking, key collisions, saved search state, source adapters, command planning,
Windows search-output parsing, and safe ZIP extraction.

On October 27, 2026, 40 test functions passed with 81.4% statement coverage, and
the Windows x64 cross-build passed. Real installations through Windows package
tools remain a separate acceptance step. This is an implemented utility under
validation; the test results do not claim every installation source has been
exercised on Windows.

For collaboration or an evaluation build, [contact Means+Measures](/contact).
