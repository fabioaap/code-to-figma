# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-20

### Added
- Initial project setup with monorepo structure using pnpm + Turbo
- Core packages:
  - `@figma-sync-engine/html-to-figma-core` - HTML to Figma JSON conversion
  - `@figma-sync-engine/autolayout-interpreter` - Auto Layout heuristics engine
  - `@figma-sync-engine/storybook-addon-export` - Storybook addon for export
  - `@figma-sync-engine/figma-plugin-lite` - Figma plugin for import
  - `@figma-sync-engine/logger` - Structured logging with PII sanitization
- **Auto Layout Engine (AL-2)**:
  - Complete `align-items` mapping to `counterAxisAlignItems`
  - Complete `justify-content` mapping to `primaryAxisAlignItems`
  - Support for flex-start, center, flex-end, space-between, baseline
  - 14 comprehensive tests for alignment properties
- **Structured Logger (OBS-1)**:
  - JSON-formatted console output
  - Log levels: ERROR, WARN, INFO, DEBUG
  - PII sanitization (email, password, token, etc.)
  - Configurable callbacks and filtering
  - 13 comprehensive tests
- **Documentation**:
  - CONTRIBUTING.md with complete contribution guidelines
  - Comprehensive FAQ section in README
  - Complete figma-json-format.md API documentation
  - Updated autolayout-engine.md with implementation details
  - Architecture documentation
  - Project backlog with epics and user stories
- **Security**:
  - Dependency audit script (`pnpm audit`)
  - Security scanning via CodeQL
  - No critical or high vulnerabilities in core packages
- **Development Tools**:
  - ESLint configuration with TypeScript and React support
  - Prettier configuration
  - Vitest for testing
  - Turbo for monorepo build orchestration

### Fixed
- Dependency version for @builder.io/html-to-figma (0.8.0 → 0.0.3)
- TypeScript build configuration for all packages
- ESLint parser configuration for proper TypeScript support
- Missing React type definitions in packages

### Testing
- 27 tests passing across all packages
- 100% pass rate on core functionality
- Comprehensive test coverage for Auto Layout and Logger

### Security
- CodeQL scanning: 0 vulnerabilities found
- Dependency audit: Only moderate vulnerabilities in dev dependencies (esbuild)
- PII sanitization implemented in logger

## [Unreleased]

### Planned
- HTML to Figma conversion implementation (MVP-3)
- Storybook addon panel completion (MVP-1, MVP-2)
- Component variants support (EPIC 3)
- Design tokens extraction (EPIC 6)
- Performance benchmarking (PERF-1)
- Additional component examples (DOC-3)
- CI/CD automation (DOC-2, DOC-4)

[0.1.0]: https://github.com/fabioaap/code-to-figma/releases/tag/v0.1.0
