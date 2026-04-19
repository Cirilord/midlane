export type DiagnosticSeverity = 'error' | 'warning';

export type Diagnostic = {
  code: DiagnosticCode;
  severity: DiagnosticSeverity;
  message: string;
};

export type DiagnosticCode =
  | 'missing_datasource'
  | 'missing_datasource_url'
  | 'missing_generator'
  | 'missing_generator_output'
  | 'duplicate_type'
  | 'duplicate_enum'
  | 'duplicate_type_field'
  | 'duplicate_enum_value'
  | 'duplicate_resource'
  | 'duplicate_action'
  | 'missing_resource_path'
  | 'missing_action_method'
  | 'missing_action_response'
  | 'unknown_type'
  | 'body_not_allowed';
