import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { runCli } from './index.js';

describe('runCli', () => {
  it('validates a schema file', async () => {
    const schemaPath = await writeSchema(`
      datasource api {
        url = env("API_URL")
      }

      generator client {
        output = "./generated/client"
      }

      type User {
        id Int
      }

      resource users {
        path = "/users"

        action list {
          method = GET
          response = User[]
        }
      }
    `);
    const io = createTestIO();

    const exitCode = await runCli(['node', 'morph', 'validate', '--schema', schemaPath], io);

    expect(exitCode).toBe(0);
    expect(io.stdoutOutput()).toContain('Schema is valid:');
    expect(io.stderrOutput()).toBe('');
  });

  it('prints diagnostics for invalid schemas', async () => {
    const schemaPath = await writeSchema(`
      datasource api {
        url = env("API_URL")
      }

      generator client {
        output = "./generated/client"
      }

      resource users {
        path = "/users"

        action list {
          method = GET
          response = MissingUser[]
        }
      }
    `);
    const io = createTestIO();

    const exitCode = await runCli(['node', 'morph', 'validate', '--schema', schemaPath], io);

    expect(exitCode).toBe(1);
    expect(io.stdoutOutput()).toBe('');
    expect(io.stderrOutput()).toContain(
      'error unknown_type: Unknown type "MissingUser" used in action "users.list" response.'
    );
  });

  it('returns an error for missing schema files', async () => {
    const io = createTestIO();

    const exitCode = await runCli(['node', 'morph', 'validate', '--schema', './missing.schema.morph'], io);

    expect(exitCode).toBe(1);
    expect(io.stdoutOutput()).toBe('');
    expect(io.stderrOutput()).toContain('error cli_error:');
  });
});

async function writeSchema(source: string): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'morph-cli-'));
  const schemaPath = join(directory, 'schema.morph');

  await writeFile(schemaPath, source);

  return schemaPath;
}

function createTestIO() {
  let stdout = '';
  let stderr = '';

  return {
    stdout: {
      write(chunk: string) {
        stdout += chunk;
        return true;
      },
    },
    stderr: {
      write(chunk: string) {
        stderr += chunk;
        return true;
      },
    },
    stdoutOutput() {
      return stdout;
    },
    stderrOutput() {
      return stderr;
    },
  };
}
