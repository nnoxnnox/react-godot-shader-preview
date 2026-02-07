import { shaderSourceToDocument } from './shaderToJson';

export interface ValidationError {
  line: number;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const SHADER_TYPES = ['spatial', 'canvas_item', 'particles', 'sky', 'fog'] as const;
const ENTRYPOINTS = ['vertex', 'fragment', 'light', 'start', 'process', 'sky', 'fog'] as const;

function entrypointHint(shaderType: string | null): string {
  if (shaderType === 'sky') return 'void sky().';
  if (shaderType === 'fog') return 'void fog().';
  if (shaderType === 'particles') return 'void start() or void process().';
  return 'void fragment() or void vertex().';
}

export function validateShader(source: string): ValidationResult {
  const doc = shaderSourceToDocument(source);
  const errors: ValidationError[] = [];

  if (!doc.shaderType || !SHADER_TYPES.includes(doc.shaderType as typeof SHADER_TYPES[number])) {
    errors.push({ line: 1, message: "Missing or invalid shader_type declaration (e.g. shader_type spatial;)." });
  }

  if (!doc.entrypoint || !ENTRYPOINTS.includes(doc.entrypoint as typeof ENTRYPOINTS[number])) {
    errors.push({ line: 1, message: "Missing or invalid entrypoint (e.g. " + entrypointHint(doc.shaderType) });
  }

  for (let i = 0; i < doc.statements.length; i++) {
    const st = doc.statements[i];
    if (st.requiresSemicolon && !st.endsWithSemicolon) {
      errors.push({ line: st.line, message: "Expected ';' at end of statement." });
    }
  }

  if (errors.length > 0) return { valid: false, errors };
  return { valid: true, errors: [] };
}
