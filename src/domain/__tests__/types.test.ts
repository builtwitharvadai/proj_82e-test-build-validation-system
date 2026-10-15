import type { BuildAdapter, BuildConfig, BuildResult, ValidationRule } from '../types.js';

/** Minimal valid configuration used across the tests. */
const mockConfig: BuildConfig = {
  command: 'npm',
  args: ['run', 'build'],
  env: { NODE_ENV: 'production' },
  cwd: '/workspace/app',
  timeout: 120_000,
};

/** Successful build result with every required field populated. */
const mockResult: BuildResult = {
  success: true,
  exitCode: 0,
  stdout: 'Build succeeded\n',
  stderr: '',
  duration: 4312,
  timestamp: new Date('2024-01-01T10:00:00.000Z'),
};

/** Rule matching unwanted output through a regular expression. */
const mockPatternRule: ValidationRule = {
  name: 'no-warnings',
  pattern: /warning/i,
  errorMessage: 'Build output must not contain warnings',
};

/** Rule applying custom logic to the whole result. */
const mockValidatorRule: ValidationRule = {
  name: 'fast-enough',
  validator: (result: BuildResult): boolean => result.duration < 60_000,
  errorMessage: 'Build must finish in under 60 seconds',
};

/** Adapter echoing back the command it was asked to run. */
const mockAdapter: BuildAdapter = {
  name: 'echo',
  execute: async (config: BuildConfig): Promise<BuildResult> => ({
    success: true,
    exitCode: 0,
    stdout: [config.command, ...config.args].join(' '),
    stderr: '',
    duration: 0,
    timestamp: new Date('2024-01-01T10:00:00.000Z'),
  }),
};

describe('BuildConfig', () => {
  it('accepts a configuration with only the required fields', () => {
    const minimal: BuildConfig = { command: 'make', args: [] };

    expect(minimal.command).toBe('make');
    expect(minimal.args).toEqual([]);
    expect(minimal.env).toBeUndefined();
    expect(minimal.cwd).toBeUndefined();
    expect(minimal.timeout).toBeUndefined();
  });

  it('accepts a configuration with every optional field', () => {
    expect(mockConfig.command).toBe('npm');
    expect(mockConfig.args).toEqual(['run', 'build']);
    expect(mockConfig.env).toEqual({ NODE_ENV: 'production' });
    expect(mockConfig.cwd).toBe('/workspace/app');
    expect(mockConfig.timeout).toBe(120_000);
  });

  it('declares its properties readonly', () => {
    // @ts-expect-error command is readonly and cannot be reassigned
    expect(() => (mockConfig.command = 'make')).toBeDefined();
    // @ts-expect-error args is a readonly array and cannot be mutated
    expect(() => mockConfig.args.push('--verbose')).toBeDefined();
  });
});

describe('BuildResult', () => {
  it('carries all required fields', () => {
    expect(mockResult.success).toBe(true);
    expect(mockResult.exitCode).toBe(0);
    expect(mockResult.stdout).toContain('Build succeeded');
    expect(mockResult.stderr).toBe('');
    expect(mockResult.duration).toBe(4312);
    expect(mockResult.timestamp).toBeInstanceOf(Date);
  });

  it('represents a failed build', () => {
    const failure: BuildResult = {
      success: false,
      exitCode: 1,
      stdout: '',
      stderr: 'error TS2322: Type mismatch\n',
      duration: 980,
      timestamp: new Date('2024-01-01T10:05:00.000Z'),
    };

    expect(failure.success).toBe(false);
    expect(failure.exitCode).toBe(1);
    expect(failure.stderr).toContain('TS2322');
  });

  it('declares its properties readonly', () => {
    // @ts-expect-error exitCode is readonly and cannot be reassigned
    expect(() => (mockResult.exitCode = 2)).toBeDefined();
  });
});

describe('ValidationRule', () => {
  it('supports a pattern-based rule', () => {
    expect(mockPatternRule.name).toBe('no-warnings');
    expect(mockPatternRule.pattern).toBeInstanceOf(RegExp);
    expect(mockPatternRule.pattern?.test('Warning: deprecated API')).toBe(true);
    expect(mockPatternRule.validator).toBeUndefined();
    expect(mockPatternRule.errorMessage).toBe('Build output must not contain warnings');
  });

  it('supports a custom validator rule', () => {
    expect(mockValidatorRule.pattern).toBeUndefined();
    expect(mockValidatorRule.validator?.(mockResult)).toBe(true);
    expect(
      mockValidatorRule.validator?.({ ...mockResult, duration: 90_000 }),
    ).toBe(false);
  });

  it('supports combining a pattern and a validator', () => {
    const combined: ValidationRule = {
      name: 'clean-and-fast',
      pattern: /error/i,
      validator: (result: BuildResult): boolean => result.exitCode === 0,
      errorMessage: 'Build must be clean and exit successfully',
    };

    expect(combined.pattern?.test('ERROR: failed')).toBe(true);
    expect(combined.validator?.(mockResult)).toBe(true);
  });
});

describe('BuildAdapter', () => {
  it('executes a config and resolves with a result', async () => {
    const result = await mockAdapter.execute(mockConfig);

    expect(mockAdapter.name).toBe('echo');
    expect(result.stdout).toBe('npm run build');
    expect(result.success).toBe(true);
  });

  it('can be implemented by a jest mock', async () => {
    const execute = jest.fn<Promise<BuildResult>, [BuildConfig]>().mockResolvedValue(mockResult);
    const adapter: BuildAdapter = { name: 'mock', execute };

    await expect(adapter.execute(mockConfig)).resolves.toEqual(mockResult);
    expect(execute).toHaveBeenCalledWith(mockConfig);
  });
});

describe('discriminated union inference', () => {
  interface SucceededBuild extends BuildResult {
    readonly success: true;
  }

  interface FailedBuild extends BuildResult {
    readonly success: false;
    readonly failedRule: string;
  }

  type BuildOutcome = SucceededBuild | FailedBuild;

  const describeOutcome = (outcome: BuildOutcome): string =>
    outcome.success ? `ok in ${outcome.duration}ms` : `failed: ${outcome.failedRule}`;

  it('narrows to the successful variant', () => {
    const outcome: BuildOutcome = { ...mockResult, success: true };

    expect(describeOutcome(outcome)).toBe('ok in 4312ms');
  });

  it('narrows to the failed variant', () => {
    const outcome: BuildOutcome = {
      ...mockResult,
      success: false,
      exitCode: 1,
      failedRule: 'no-warnings',
    };

    expect(describeOutcome(outcome)).toBe('failed: no-warnings');
  });
});
