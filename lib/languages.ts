export type LanguageConfig = {
  label: string;
  lineComment?: string | string[];
  blockComment?: [string, string][];
};

export const LANGUAGE_MAP: Record<string, LanguageConfig> = {
  // JavaScript & variations
  js: { label: 'JavaScript', lineComment: '//', blockComment: [['/*', '*/']] },
  jsx: { label: 'JavaScript', lineComment: '//', blockComment: [['/*', '*/']] },
  mjs: { label: 'JavaScript', lineComment: '//', blockComment: [['/*', '*/']] },
  cjs: { label: 'JavaScript', lineComment: '//', blockComment: [['/*', '*/']] },

  // TypeScript
  ts: { label: 'TypeScript', lineComment: '//', blockComment: [['/*', '*/']] },
  tsx: { label: 'TypeScript', lineComment: '//', blockComment: [['/*', '*/']] },

  // Python
  py: { label: 'Python', lineComment: '#', blockComment: [["'''", "'''"], ['"""', '"""']] },

  // CSS and preprocessors
  css: { label: 'CSS', blockComment: [['/*', '*/']] },
  scss: { label: 'SCSS', lineComment: '//', blockComment: [['/*', '*/']] },
  less: { label: 'Less', lineComment: '//', blockComment: [['/*', '*/']] },

  // HTML
  html: { label: 'HTML', blockComment: [['<!--', '-->']] },
  htm: { label: 'HTML', blockComment: [['<!--', '-->']] },

  // JSON
  json: { label: 'JSON' },

  // Java
  java: { label: 'Java', lineComment: '//', blockComment: [['/*', '*/']] },

  // C / C++
  c: { label: 'C', lineComment: '//', blockComment: [['/*', '*/']] },
  h: { label: 'C/C++ Header', lineComment: '//', blockComment: [['/*', '*/']] },
  cpp: { label: 'C++', lineComment: '//', blockComment: [['/*', '*/']] },
  hpp: { label: 'C/C++ Header', lineComment: '//', blockComment: [['/*', '*/']] },
  cc: { label: 'C++', lineComment: '//', blockComment: [['/*', '*/']] },

  // C#
  cs: { label: 'C#', lineComment: '//', blockComment: [['/*', '*/']] },

  // Go
  go: { label: 'Go', lineComment: '//', blockComment: [['/*', '*/']] },

  // Rust
  rs: { label: 'Rust', lineComment: '//', blockComment: [['/*', '*/']] },

  // Ruby
  rb: { label: 'Ruby', lineComment: '#', blockComment: [['=begin', '=end']] },

  // PHP
  php: { label: 'PHP', lineComment: ['//', '#'], blockComment: [['/*', '*/']] },

  // Shell
  sh: { label: 'Shell', lineComment: '#' },
  bash: { label: 'Shell', lineComment: '#' },
  zsh: { label: 'Shell', lineComment: '#' },

  // SQL
  sql: { label: 'SQL', lineComment: '--', blockComment: [['/*', '*/']] },

  // Swift
  swift: { label: 'Swift', lineComment: '//', blockComment: [['/*', '*/']] },

  // Kotlin
  kt: { label: 'Kotlin', lineComment: '//', blockComment: [['/*', '*/']] },
  kts: { label: 'Kotlin', lineComment: '//', blockComment: [['/*', '*/']] },

  // Vue
  vue: { label: 'Vue', lineComment: '//', blockComment: [['/*', '*/'], ['<!--', '-->']] },

  // Excluded config definitions (keep definitions for completeness)
  md: { label: 'Markdown' },
  mdx: { label: 'Markdown' },
  yaml: { label: 'YAML', lineComment: '#' },
  yml: { label: 'YAML', lineComment: '#' },
  toml: { label: 'TOML', lineComment: '#' },
};

export function getLanguageForExtension(ext: string): LanguageConfig {
  const cleanExt = ext.startsWith('.') ? ext.slice(1).toLowerCase() : ext.toLowerCase();
  return LANGUAGE_MAP[cleanExt] || { label: 'Other' };
}
