export type MorphConfig = {
  datasource?: {
    url?: string | undefined;
  };
  schema?: string | undefined;
};

export function defineConfig(config: MorphConfig): MorphConfig {
  return config;
}
