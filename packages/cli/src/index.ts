import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ParseError, parseMorphSchema, TokenizeError, validateMorphSchema } from '@morph/parser';
import { cac } from 'cac';

type CliIO = {
  stdout: Pick<NodeJS.WriteStream, 'write'>;
  stderr: Pick<NodeJS.WriteStream, 'write'>;
};

type ValidateOptions = {
  schema?: string;
};

const defaultSchemaPath = 'schema.morph';

export async function runCli(argv: string[], io: CliIO = process): Promise<number> {
  const cli = cac('morph');
  let exitCode = 0;

  cli
    .command('validate', 'Validate a Morph schema')
    .option('--schema <path>', 'Path to the schema file', {
      default: defaultSchemaPath,
    })
    .action(async (options: ValidateOptions) => {
      exitCode = await validateCommand(options, io);
    });

  cli.help();
  cli.parse(argv, { run: false });

  const matchedCommand = cli.matchedCommand;

  if (matchedCommand === undefined) {
    cli.outputHelp();
    return 1;
  }

  await cli.runMatchedCommand();

  return exitCode;
}

async function validateCommand(options: ValidateOptions, io: CliIO): Promise<number> {
  const schemaPath = resolve(options.schema ?? defaultSchemaPath);

  try {
    const source = await readFile(schemaPath, 'utf8');
    const schema = parseMorphSchema(source);
    const diagnostics = validateMorphSchema(schema);

    if (diagnostics.length === 0) {
      io.stdout.write(`Schema is valid: ${schemaPath}\n`);
      return 0;
    }

    for (const diagnostic of diagnostics) {
      io.stderr.write(`${diagnostic.severity} ${diagnostic.code}: ${diagnostic.message}\n`);
    }

    return diagnostics.some((diagnostic) => diagnostic.severity === 'error') ? 1 : 0;
  } catch (error) {
    io.stderr.write(`${formatCliError(error)}\n`);
    return 1;
  }
}

function formatCliError(error: unknown): string {
  if (error instanceof ParseError || error instanceof TokenizeError) {
    return `error invalid_schema: ${error.message}`;
  }

  if (error instanceof Error) {
    return `error cli_error: ${error.message}`;
  }

  return 'error cli_error: Unknown error.';
}

const isDirectExecution = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  const exitCode = await runCli(process.argv);
  process.exitCode = exitCode;
}
