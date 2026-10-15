/**
 * Main library entry point for the Build Validator.
 *
 * Core functionality is re-exported from this module as it is implemented.
 * For now it exposes the core domain types and the package version placeholder.
 *
 * @packageDocumentation
 */

export * from './domain/types.js';

/**
 * Current version of the build validator library.
 *
 * Kept in sync with the `version` field in `package.json`.
 */
export const VERSION = '0.1.0';
