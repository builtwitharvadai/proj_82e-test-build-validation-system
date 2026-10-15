/**
 * Core domain types for the build validation system.
 *
 * These interfaces form the contract shared by every module: adapters produce
 * {@link BuildResult} values from a {@link BuildConfig}, and {@link ValidationRule}
 * definitions decide whether those results are acceptable.
 *
 * @packageDocumentation
 */

/**
 * Describes a single build invocation.
 *
 * @example
 * ```ts
 * const config: BuildConfig = {
 *   command: 'npm',
 *   args: ['run', 'build'],
 *   env: { NODE_ENV: 'production' },
 *   cwd: '/workspace/app',
 *   timeout: 120_000,
 * };
 * ```
 */
export interface BuildConfig {
  /** Executable to run, e.g. `'npm'` or `'make'`. */
  readonly command: string;
  /** Arguments passed to {@link BuildConfig.command}, in order. */
  readonly args: readonly string[];
  /** Extra environment variables merged into the build process environment. */
  readonly env?: Readonly<Record<string, string>>;
  /** Working directory for the build; defaults to the current process directory. */
  readonly cwd?: string;
  /** Maximum run time in milliseconds before the build is aborted. */
  readonly timeout?: number;
}

/**
 * Outcome of executing a {@link BuildConfig}.
 *
 * @example
 * ```ts
 * const result: BuildResult = {
 *   success: true,
 *   exitCode: 0,
 *   stdout: 'Build succeeded\n',
 *   stderr: '',
 *   duration: 4312,
 *   timestamp: new Date('2024-01-01T10:00:00.000Z'),
 * };
 * ```
 */
export interface BuildResult {
  /** `true` when the build completed as expected. */
  readonly success: boolean;
  /** Process exit code; `0` conventionally indicates success. */
  readonly exitCode: number;
  /** Captured standard output. */
  readonly stdout: string;
  /** Captured standard error. */
  readonly stderr: string;
  /** Wall-clock duration of the build in milliseconds. */
  readonly duration: number;
  /** Moment the build finished. */
  readonly timestamp: Date;
}

/**
 * A single check applied to a {@link BuildResult}.
 *
 * A rule may match output with {@link ValidationRule.pattern}, apply custom logic
 * with {@link ValidationRule.validator}, or combine both.
 *
 * @example
 * ```ts
 * const noWarnings: ValidationRule = {
 *   name: 'no-warnings',
 *   pattern: /warning/i,
 *   errorMessage: 'Build output must not contain warnings',
 * };
 *
 * const fastEnough: ValidationRule = {
 *   name: 'fast-enough',
 *   validator: (result) => result.duration < 60_000,
 *   errorMessage: 'Build must finish in under 60 seconds',
 * };
 * ```
 */
export interface ValidationRule {
  /** Unique, human-readable identifier for the rule. */
  readonly name: string;
  /** Regular expression evaluated against the build output. */
  readonly pattern?: RegExp;
  /** Predicate returning `true` when the result satisfies the rule. */
  readonly validator?: (result: BuildResult) => boolean;
  /** Message reported when the rule fails. */
  readonly errorMessage: string;
}

/**
 * Pluggable strategy that knows how to run a build for a specific toolchain.
 *
 * @example
 * ```ts
 * const echoAdapter: BuildAdapter = {
 *   name: 'echo',
 *   async execute(config) {
 *     return {
 *       success: true,
 *       exitCode: 0,
 *       stdout: [config.command, ...config.args].join(' '),
 *       stderr: '',
 *       duration: 0,
 *       timestamp: new Date(),
 *     };
 *   },
 * };
 * ```
 */
export interface BuildAdapter {
  /** Identifier of the adapter, e.g. `'npm'` or `'make'`. */
  readonly name: string;
  /** Runs the build described by `config` and resolves with its result. */
  readonly execute: (config: BuildConfig) => Promise<BuildResult>;
}
