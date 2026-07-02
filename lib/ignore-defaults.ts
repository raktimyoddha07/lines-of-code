export const DEFAULT_IGNORED_FOLDERS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.nuxt',
  '.svelte-kit',
  'dist',
  'build',
  'out',
  '.turbo',
  '.vercel',
  '.cache',
  'coverage',
  'venv',
  '.venv',
  'env',
  '.env', // Only if it's a directory
  '__pycache__',
  '.pytest_cache',
  '.mypy_cache',
  'target',
  'bin',
  'obj',
  'vendor',
  '.idea',
  '.vscode',
  'Pods',
  'DerivedData',
  '.gradle',
  '.terraform'
]);

export const DEFAULT_IGNORED_FILES = [
  // compiled / binaries
  '*.pyc', '*.pyo', '*.pyd',
  '*.class', '*.o', '*.obj', '*.dll', '*.exe', '*.so', '*.dylib',
  
  // locks
  '*.lock',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'Cargo.lock',
  'poetry.lock',
  'Gemfile.lock',
  
  // documents & static metadata
  '*.md', '*.mdx',
  '*.json',
  '*.yaml', '*.yml',
  '*.toml',
  
  // Docker
  'Dockerfile', 'docker-compose*.yml', '.dockerignore',
  
  // configs
  '.gitignore', '.gitattributes',
  '.editorconfig',
  '.eslintrc*', '.prettierrc*', '.stylelintrc*',
  
  // env files
  '.env', '.env.*',
  
  // licenses
  'LICENSE', 'LICENSE.*', 'NOTICE',
  
  // logs
  '*.log',
  
  // source maps
  '*.map',
  
  // OS files
  '.DS_Store', 'Thumbs.db',
  
  // vectors/media
  '*.svg'
];
