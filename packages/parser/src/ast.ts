export type ApiSchema = {
  kind: 'schema';
  generator?: GeneratorDeclaration;
  types: TypeDeclaration[];
  enums: EnumDeclaration[];
  resources: ResourceDeclaration[];
};

export type GeneratorDeclaration = {
  kind: 'generator';
  name: string;
  output?: string;
};

export type TypeDeclaration = {
  kind: 'type';
  name: string;
  fields: FieldDeclaration[];
};

export type FieldDeclaration = {
  kind: 'field';
  name: string;
  type: TypeRef;
  map?: string;
};

export type TypeRef = {
  name: string;
  isArray: boolean;
  isOptional: boolean;
};

export type EnumDeclaration = {
  kind: 'enum';
  name: string;
  values: string[];
};

export type ResourceDeclaration = {
  kind: 'resource';
  name: string;
  path?: string;
  actions: ActionDeclaration[];
  resources: ResourceDeclaration[];
};

export type ActionDeclaration = {
  kind: 'action';
  name: string;
  method?: HttpMethod;
  path?: string;
  params?: TypeRef;
  query?: TypeRef;
  body?: TypeRef;
  headers?: TypeRef;
  response?: TypeRef;
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
