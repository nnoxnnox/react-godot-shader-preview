/** Shader source → JSON document for schema validation (validateShader). */
export interface ParsedStatement {
  line: number;
  text: string;
  requiresSemicolon: boolean;
  endsWithSemicolon: boolean;
}

export interface GdShaderDocument {
  shaderType: string | null;
  entrypoint: string | null;
  statements: ParsedStatement[];
}

function stripLineComment(line: string): string {
  return line.replace(/\/\/.*$/, '').trim();
}

function lineRequiresSemicolon(stripped: string): boolean {
  if (!stripped || /^\s*(shader_type|render_mode)\s/.test(stripped) || /^\s*#/.test(stripped)) return false;
  if (stripped.endsWith('{') || stripped.endsWith('}') || stripped.endsWith('};') || stripped.endsWith(',')) return false;
  if (/^\s*\{\s*$/.test(stripped) || /^\s*\}\s*$/.test(stripped)) return false;
  if (/^\s*(if|else|for|while|do|switch)\s*\(/.test(stripped) || /^\s*else\s*$/.test(stripped)) return false;
  if (/^\s*struct\s+\w+\s*\{/.test(stripped)) return false;
  if (/^\s*(void|float|int|uint|bool|vec2|vec3|vec4|mat\d|sampler\w*)\s+\w+\s*\(/.test(stripped)) return false;
  if (stripped.includes('=') && !/==|!=|<=|>=/.test(stripped)) return true;
  if (/\breturn\b/.test(stripped)) return true;
  if (/\w\s*\([^)]*\)\s*$/.test(stripped)) return true;
  return false;
}

export function shaderSourceToDocument(source: string): GdShaderDocument {
  const lines = source.split(/\r?\n/);
  let shaderType: string | null = null;
  let entrypoint: string | null = null;
  const statements: ParsedStatement[] = [];

  const shaderTypeMatch = source.match(/\bshader_type\s+(\w+)\s*;/);
  if (shaderTypeMatch) shaderType = shaderTypeMatch[1];

  const entrypointMatch = source.match(/\bvoid\s+(vertex|fragment|light|start|process|sky|fog)\s*\(/);
  if (entrypointMatch) entrypoint = entrypointMatch[1];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const stripped = stripLineComment(raw).replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!stripped) continue;
    const requiresSemicolon = lineRequiresSemicolon(stripped);
    const endsWithSemicolon = stripped.endsWith(';');
    statements.push({
      line: i + 1,
      text: stripped,
      requiresSemicolon,
      endsWithSemicolon,
    });
  }

  return { shaderType, entrypoint, statements };
}
