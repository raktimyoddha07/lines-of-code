export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Less: '#1d365d',
  HTML: '#e34c26',
  JSON: '#292929',
  Java: '#b07219',
  C: '#555555',
  'C++': '#f34b7d',
  'C/C++ Header': '#f34b7d',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Shell: '#89e051',
  SQL: '#e38c00',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Vue: '#41B883',
  Markdown: '#083fa1',
  YAML: '#cb171e',
  TOML: '#9c4221',
  Other: '#8b949e',
};

/**
 * Returns a stable color string (hex) for a given language name.
 */
export function getLanguageColor(lang: string): string {
  if (LANGUAGE_COLORS[lang]) {
    return LANGUAGE_COLORS[lang];
  }

  // Fallback: Simple hash algorithm to generate a stable HSL color
  let hash = 0;
  for (let i = 0; i < lang.length; i++) {
    hash = lang.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h = Math.abs(hash) % 360;
  // Use a nice saturation and lightness for a modern look
  return `hsl(${h}, 70%, 55%)`;
}
