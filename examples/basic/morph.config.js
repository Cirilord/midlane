import { defineConfig } from '@morph/config';

export default defineConfig({
  datasource: {
    url: process.env.API_URL ?? 'https://legacy-api.example.com',
  },
  schema: 'morph/morph.schema',
});
