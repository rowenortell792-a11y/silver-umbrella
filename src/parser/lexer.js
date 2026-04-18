/**
 * GGC Lexer - Tokenizes .ggc files into structured AST
 * Version: 1.0.0
 * Part of the GGC Literary Format Compiler
 * 
 * Converts raw .ggc text into executable tokens for validation and rendering
 */

class GGCLexer {
  constructor(input) {
    this.input = input;
    this.tokens = [];
    this.currentLine = 0;
    this.lines = input.split('\n');
  }

  tokenize() {
    let currentPage = null;
    let currentPanel = null;
    let pageNumber = 1;
    let panelNumber = 1;

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const trimmed = line.trim();
      
      if (trimmed === '') continue; // Skip empty lines
      
      // Page delimiter
      if (trimmed.startsWith('[PAGE')) {
        if (currentPage) {
          this.tokens.push(currentPage);
        }
        currentPage = {
          type: 'PAGE',
          number: this.extractPageNumber(trimmed, pageNumber),
          panels: []
        };
        panelNumber = 1;
        pageNumber++;
        currentPanel = null;
      } 
      // Panel delimiter
      else if (trimmed.startsWith('[PANEL')) {
        if (currentPanel && currentPage) {
          currentPage.panels.push(currentPanel);
        }
        currentPanel = {
          type: 'PANEL',
          number: this.extractPanelNumber(trimmed, panelNumber),
          visual: '',
          dialogue: '',
          visualRaw: '',
          dialogueRaw: ''
        };
        panelNumber++;
      }
      // Visual line
      else if (trimmed.startsWith('VISUAL:')) {
        if (currentPanel) {
          const visualText = trimmed.replace('VISUAL:', '').trim();
          currentPanel.visual = visualText;
          currentPanel.visualRaw = line;
        }
      }
      // Dialogue line
      else if (trimmed.startsWith('DIALOGUE:')) {
        if (currentPanel) {
          const dialogueText = trimmed.replace('DIALOGUE:', '').trim();
          currentPanel.dialogue = dialogueText;
          currentPanel.dialogueRaw = line;
        }
      }
      // Metadata (future use)
      else if (trimmed.startsWith('@')) {
        if (currentPage) {
          if (!currentPage.metadata) currentPage.metadata = [];
          currentPage.metadata.push(trimmed);
        }
      }
    }
    
    // Push the last page
    if (currentPanel && currentPage) {
      currentPage.panels.push(currentPanel);
    }
    if (currentPage) {
      this.tokens.push(currentPage);
    }
    
    return this.tokens;
  }

  extractPageNumber(str, defaultNum) {
    const match = str.match(/\[PAGE\s*(\d+)\]/);
    return match ? parseInt(match[1]) : defaultNum;
  }

  extractPanelNumber(str, defaultNum) {
    const match = str.match(/\[PANEL\s*(\d+)\]/);
    return match ? parseInt(match[1]) : defaultNum;
  }

  getValidationReport() {
    const report = {
      totalPages: 0,
      totalPanels: 0,
      totalDialogueLines: 0,
      pagesWithZeroDialogue: 0,
      errors: []
    };

    for (const page of this.tokens) {
      report.totalPages++;
      let pageDialogueLines = 0;
      
      for (const panel of page.panels) {
        report.totalPanels++;
        if (panel.dialogue && panel.dialogue.length > 0) {
          const lines = panel.dialogue.split('\n').filter(l => l.trim().length > 0);
          pageDialogueLines += lines.length;
          report.totalDialogueLines += lines.length;
        }
      }
      
      if (pageDialogueLines === 0) {
        report.pagesWithZeroDialogue++;
      }
      
      // Rule: Max 3 panels per page
      if (page.panels.length > 3) {
        report.errors.push(`Page ${page.number}: ${page.panels.length} panels. Maximum is 3.`);
      }
      
      // Rule: Max 2 dialogue lines per page
      if (pageDialogueLines > 2) {
        report.errors.push(`Page ${page.number}: ${pageDialogueLines} dialogue lines. Maximum is 2.`);
      }
    }
    
    return report;
  }
}

module.exports = { GGCLexer };
