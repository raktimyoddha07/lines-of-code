import { LanguageConfig } from './languages';

export type LineCounts = {
  totalLines: number;
  blankLines: number;
  commentLines: number;
  codeLines: number;
};

/**
 * Sniffs the content of a file to check if it's binary.
 * A file is considered binary if it contains a NUL byte (\0)
 * or if more than 2% of its characters in the first 8KB are non-printable.
 */
export function isBinaryContent(content: string): boolean {
  if (content.includes('\0')) {
    return true;
  }

  const sample = content.slice(0, 8192);
  if (sample.length === 0) return false;

  let nonPrintableCount = 0;
  for (let i = 0; i < sample.length; i++) {
    const charCode = sample.charCodeAt(i);
    // Control characters except Tab (\t), LF (\n), CR (\r)
    if ((charCode < 32 && charCode !== 9 && charCode !== 10 && charCode !== 13) || charCode === 127) {
      nonPrintableCount++;
    }
  }

  return (nonPrintableCount / sample.length) > 0.02;
}

/**
 * Counts blank, comment, and code lines in a file's text content.
 */
export function countLines(content: string, language: LanguageConfig): LineCounts {
  // Normalize line endings
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  
  // If the file is completely empty (0 characters), it still has 0 lines.
  if (lines.length === 1 && lines[0] === '') {
    return { totalLines: 0, blankLines: 0, commentLines: 0, codeLines: 0 };
  }

  let blankLines = 0;
  let commentLines = 0;
  let codeLines = 0;

  const state = { inBlockClose: null as string | null };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      // Blank line. Note: if we are in a block comment, a blank line is still counted as blank
      blankLines++;
      continue;
    }

    let index = 0;
    let hasCode = false;
    let hasComment = false;

    // Use a copy of state to see if it changes during line scanning
    while (index < line.length) {
      if (state.inBlockClose) {
        hasComment = true;
        const closeIndex = line.indexOf(state.inBlockClose, index);
        if (closeIndex === -1) {
          // Block comment continues to next line
          break;
        } else {
          // Block comment ends on this line
          index = closeIndex + state.inBlockClose.length;
          state.inBlockClose = null;
          continue;
        }
      }

      // Skip whitespace
      const char = line[index];
      if (/\s/.test(char)) {
        index++;
        continue;
      }

      // Check single line comments
      let matchedLineComment = false;
      if (language.lineComment) {
        const prefixes = Array.isArray(language.lineComment) ? language.lineComment : [language.lineComment];
        for (const pref of prefixes) {
          if (line.startsWith(pref, index)) {
            matchedLineComment = true;
            break;
          }
        }
      }

      if (matchedLineComment) {
        hasComment = true;
        break; // Remainder of line is a comment
      }

      // Check block comments
      let matchedBlockComment = false;
      if (language.blockComment) {
        for (const [open, close] of language.blockComment) {
          if (line.startsWith(open, index)) {
            state.inBlockClose = close;
            index += open.length;
            matchedBlockComment = true;
            hasComment = true;
            break;
          }
        }
      }

      if (matchedBlockComment) {
        continue;
      }

      // It's a non-whitespace, non-comment character, so it is code!
      hasCode = true;
      break;
    }

    if (hasCode) {
      codeLines++;
    } else if (hasComment) {
      commentLines++;
    } else {
      // Fallback (e.g. whitespace line that skipped character check, should be blank but handled above)
      blankLines++;
    }
  }

  return {
    totalLines: lines.length,
    blankLines,
    commentLines,
    codeLines,
  };
}
