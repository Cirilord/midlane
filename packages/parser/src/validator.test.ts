import { describe, expect, it } from 'vitest';

import { parseMorphSchema } from './parser.js';
import { validateMorphSchema } from './validator.js';

describe('validateMorphSchema', () => {
  it('accepts a valid schema', () => {
    const schema = parseMorphSchema(`
      datasource api {
        url = env("API_URL")
      }

      generator client {
        output = "./generated/client"
      }

      enum UserStatus {
        ACTIVE
        BLOCKED
      }

      type User {
        id Int @map("usr_id")
        name String
        status UserStatus
      }

      type ListUsersQuery {
        search String?
      }

      resource users {
        path = "/users"

        action list {
          method = GET
          query = ListUsersQuery
          response = User[]
        }
      }
    `);

    expect(validateMorphSchema(schema)).toEqual([]);
  });

  it('reports missing root declarations and required properties', () => {
    const schema = parseMorphSchema(`
      datasource api {
      }

      resource users {
        action list {
        }
      }
    `);

    expect(validateMorphSchema(schema)).toEqual([
      {
        code: 'missing_datasource_url',
        severity: 'error',
        message: 'Datasource "api" is missing url.',
      },
      {
        code: 'missing_generator',
        severity: 'error',
        message: 'Missing generator declaration.',
      },
      {
        code: 'missing_resource_path',
        severity: 'error',
        message: 'Resource "users" is missing path.',
      },
      {
        code: 'missing_action_method',
        severity: 'error',
        message: 'Action "users.list" is missing method.',
      },
      {
        code: 'missing_action_response',
        severity: 'error',
        message: 'Action "users.list" is missing response.',
      },
    ]);
  });

  it('reports duplicate declarations and members', () => {
    const schema = parseMorphSchema(`
      datasource api {
        url = "https://example.com"
      }

      generator client {
        output = "./generated/client"
      }

      enum Role {
        ADMIN
        ADMIN
      }

      enum Role {
        USER
      }

      type User {
        id Int
        id String
      }

      type User {
        name String
      }

      resource users {
        path = "/users"

        action list {
          method = GET
          response = User[]
        }

        action list {
          method = GET
          response = User[]
        }

        resource posts {
          path = "/posts"
        }

        resource posts {
          path = "/posts"
        }
      }
    `);

    expect(validateMorphSchema(schema).map((diagnostic) => diagnostic.code)).toEqual([
      'duplicate_type',
      'duplicate_enum',
      'duplicate_type_field',
      'duplicate_enum_value',
      'duplicate_action',
      'duplicate_resource',
    ]);
  });

  it('reports unknown referenced types and bodyless method bodies', () => {
    const schema = parseMorphSchema(`
      datasource api {
        url = env("API_URL")
      }

      generator client {
        output = "./generated/client"
      }

      type User {
        id MissingId
      }

      resource users {
        path = "/users"

        action list {
          method = GET
          query = MissingQuery
          body = MissingBody
          response = MissingResponse[]
        }
      }
    `);

    expect(validateMorphSchema(schema)).toEqual([
      {
        code: 'unknown_type',
        severity: 'error',
        message: 'Unknown type "MissingId" used in type "User" field "id".',
      },
      {
        code: 'body_not_allowed',
        severity: 'error',
        message: 'Action "users.list" uses body with GET.',
      },
      {
        code: 'unknown_type',
        severity: 'error',
        message: 'Unknown type "MissingQuery" used in action "users.list" query.',
      },
      {
        code: 'unknown_type',
        severity: 'error',
        message: 'Unknown type "MissingBody" used in action "users.list" body.',
      },
      {
        code: 'unknown_type',
        severity: 'error',
        message: 'Unknown type "MissingResponse" used in action "users.list" response.',
      },
    ]);
  });
});
