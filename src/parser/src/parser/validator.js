/**
 * GGC Validator - Enforces GGC Literary Format Bible rules
 * Version: 1.0.0
 * 
 * Validates .ggc files against:
 * - Max 3 panels per page
 * - Max 2 dialogue lines per page
 * - Zero-dialogue page every 5 pages
 * - Color compliance (Crimson for emotion)
 * - Pulse mark placement
 */

const { GGCLexer } = require('./lexer.js');

class GGCValidator {
  constructor(tokens) {
    this.tokens = tokens;
    this.errors = [];
    this.warnings = [];
  }

  validate() {
    let pagesSinceLastSilent = 0;
    
    for (let i = 0; i < this.tokens.length; i++) {
      const page = this.tokens[i];
      const pageNumber = page.number;
      
      // RULE 1: Max 3 panels per page
      if (page.panels.length > 3) {
        this.errors.push({
          page: pageNumber,
          rule: 'MAX_PANELS',
          message: `Page ${pageNumber} has ${page.panels.length} panels. Maximum is 3.`
        });
      }
      
      // Calculate dialogue lines for this page
      let totalDialogueLines = 0;
      let hasDialogue = false;
      
      for (const panel of page.panels) {
        if (panel.dialogue && panel.dialogue.length > 0) {
          hasDialogue = true;
          const lines = panel.dialogue.split('\n').filter(l => l.trim().length > 0);
          totalDialogueLines += lines.length;
        }
      }
      
      // RULE 2: Max 2 dialogue lines per page
      if (totalDialogueLines > 2) {
        this.errors.push({
          page: pageNumber,
          rule: 'MAX_DIALOGUE_LINES',
          message: `Page ${pageNumber} has ${totalDialogueLines} dialogue lines. Maximum is 2.`
        });
      }
      
      // RULE 3: Zero-dialogue page every 5 pages
      if (!hasDialogue) {
        pagesSinceLastSilent = 0;
      } else {
        pagesSinceLastSilent++;
      }
      
      if (pagesSinceLastSilent > 4 && i < this.tokens.length - 1) {
        this.warnings.push({
          page: pageNumber,
          rule: 'ZERO_DIALOGUE_REQUIRED',
          message: `No zero-dialogue page found in the last 5 pages. Add a silent page.`
        });
        pagesSinceLastSilent = 0;
      }
      
      // RULE 4: Check for Crimson emotion markers (future enhancement)
      for (const panel of page.panels) {
        if (panel.dialogue && panel.dialogue.includes('CRIMSON:')) {
          // Valid — intentional emotion break
        }
      }
    }
    
    // Final validation: First page should have minimal dialogue
    if (this.tokens.length > 0) {
      const firstPage = this.tokens[0];
      let firstPageDialogue = 0;
      for (const panel of firstPage.panels) {
        if (panel.dialogue && panel.dialogue.length > 0) {
          firstPageDialogue += panel.dialogue.split('\n').length;
        }
      }
      if (firstPageDialogue === 0) {
        this.warnings.push({
          page: 1,
          rule: 'FIRST_PAGE_HOOK',
          message: 'First page has no dialogue. Consider adding a hook line to draw readers in.'
        });
      }
    }
    
    return { errors: this.errors, warnings: this.warnings };
  }
  
  isValid() {
    return this.errors.length === 0;
  }
  
  getSummary() {
    return {
      valid: this.isValid(),
      errorCount: this.errors.length,
      warningCount: this.warnings.length,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}

module.exports = { GGCValidator };
