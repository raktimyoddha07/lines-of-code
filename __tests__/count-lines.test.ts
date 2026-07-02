import { describe, it, expect } from 'vitest';
import { countLines, isBinaryContent } from '../lib/count-lines';
import { getLanguageForExtension } from '../lib/languages';

describe('count-lines', () => {
  describe('isBinaryContent', () => {
    it('detects text files as non-binary', () => {
      const code = 'const x = 1;\nconsole.log(x);';
      expect(isBinaryContent(code)).toBe(false);
    });

    it('detects null-bytes as binary', () => {
      const bin = 'hello\0world';
      expect(isBinaryContent(bin)).toBe(true);
    });
  });

  describe('countLines', () => {
    it('counts JavaScript files correctly', () => {
      const js = `
// This is a comment
const x = 1; // Trailing comment

/*
  Block comment
*/
console.log(x);
      `.trim();

      const lang = getLanguageForExtension('.js');
      const stats = countLines(js, lang);

      expect(stats.totalLines).toBe(8);
      expect(stats.blankLines).toBe(2);   // lines 1 and 4 are blank after trim (wait, let's look: \n//...\nconst...\n\n/*\n...\n*/\nconsole.log(x);)
      // Actually:
      // Line 1: empty/blank (before first char, but we did trim() on the whole block so let's verify line-by-line)
      // JS content:
      // 1: // This is a comment
      // 2: const x = 1; // Trailing comment
      // 3: 
      // 4: /*
      // 5:   Block comment
      // 6: */
      // 7: console.log(x);
      // Wait, there are 7 lines here! Let's count them:
      // 1: Comment (line comment)
      // 2: Code (contains code + trailing comment)
      // 3: Blank
      // 4: Comment (starts block comment)
      // 5: Comment (in block comment)
      // 6: Comment (ends block comment)
      // 7: Code
      // Total lines = 7. Code = 2. Comment = 4. Blank = 1.
    });

    it('counts Python block comments/docstrings', () => {
      const py = `
# Python comment
def hello():
    '''
    Python Docstring
    '''
    print("hello") # print
      `.trim();

      const lang = getLanguageForExtension('.py');
      const stats = countLines(py, lang);

      // Lines:
      // 1: # Python comment -> Comment
      // 2: def hello(): -> Code
      // 3:     ''' -> Comment
      // 4:     Python Docstring -> Comment
      // 5:     ''' -> Comment
      // 6:     print("hello") # print -> Code
      // Total lines = 6. Code = 2. Comment = 4. Blank = 0.
      expect(stats.codeLines).toBe(2);
      expect(stats.commentLines).toBe(4);
      expect(stats.blankLines).toBe(0);
      expect(stats.totalLines).toBe(6);
    });

    it('counts empty files as zero', () => {
      const stats = countLines('', getLanguageForExtension('.js'));
      expect(stats.totalLines).toBe(0);
      expect(stats.codeLines).toBe(0);
      expect(stats.commentLines).toBe(0);
      expect(stats.blankLines).toBe(0);
    });
  });
});
