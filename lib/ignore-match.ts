import { DEFAULT_IGNORED_FOLDERS, DEFAULT_IGNORED_FILES } from './ignore-defaults';

/**
 * Converts a simple glob pattern (*, **, ?) to a Regular Expression.
 */
export function globToRegex(pattern: string): RegExp {
  // Normalize backslashes to forward slashes
  let p = pattern.replace(/\\/g, '/');
  
  // Escape standard regex characters except our glob wildcards
  let escaped = p.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  
  // Convert globs to regex structures
  // Use unique placeholders to prevent recursive replacement issues
  let regexStr = escaped
    .replace(/\*\*/g, '___ANY_DIR___')
    .replace(/\*/g, '___ANY_CHARS___')
    .replace(/\?/g, '___ONE_CHAR___');
    
  regexStr = regexStr
    .replace(/___ANY_DIR___/g, '.*')
    .replace(/___ANY_CHARS___/g, '[^/]*')
    .replace(/___ONE_CHAR___/g, '[^/]');

  // If the pattern doesn't contain a slash, match it anywhere (like *.js or file name matches)
  if (!p.includes('/')) {
    return new RegExp(`(^|/)${regexStr}($|/)`);
  }
  
  // If it starts with **/, match it anywhere in the path
  if (p.startsWith('**/')) {
    return new RegExp(`(^|/)${regexStr.slice(5)}($|/)`);
  }
  
  // Otherwise, match from the beginning of the relative path
  const cleanStart = p.startsWith('/') ? '^' + regexStr.slice(1) : '^' + regexStr;
  return new RegExp(`${cleanStart}($|/)`);
}

/**
 * Checks if a path segment matches any of the default folder ignore rules.
 */
export function isDefaultFolderIgnored(relativePath: string): boolean {
  const parts = relativePath.replace(/\\/g, '/').split('/');
  return parts.some(part => DEFAULT_IGNORED_FOLDERS.has(part));
}

/**
 * Checks if a path matches default ignored files patterns.
 */
export function isDefaultFileIgnored(relativePath: string): boolean {
  const normalizedPath = relativePath.replace(/\\/g, '/');
  
  // First check if any parent directory is ignored by folder rules
  if (isDefaultFolderIgnored(normalizedPath)) {
    return true;
  }
  
  // Check against each default file glob pattern
  for (const pattern of DEFAULT_IGNORED_FILES) {
    const rx = globToRegex(pattern);
    if (rx.test(normalizedPath)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Checks if a path matches a user's manual ignore list patterns.
 */
export function isManuallyIgnored(relativePath: string, manualIgnores: string[]): boolean {
  if (manualIgnores.length === 0) return false;
  
  const normalizedPath = relativePath.replace(/\\/g, '/');
  
  for (const pattern of manualIgnores) {
    if (!pattern.trim()) continue;
    
    const rx = globToRegex(pattern.trim());
    if (rx.test(normalizedPath)) {
      return true;
    }
  }
  
  return false;
}
