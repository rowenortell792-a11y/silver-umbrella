/**
 * GGC Parser for Discord Bot
 * Validates .ggc format from messages
 */

function validateGGC(content) {
  const lines = content.split('\n');
  const pages = [];
  let currentPage = null;
  let currentPanel = null;
  const errors = [];
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    
    if (trimmed === '') continue;
    
    if (trimmed.startsWith('[PAGE')) {
      if (currentPage) pages.push(currentPage);
      currentPage = { number: pages.length + 1, panels: [] };
      currentPanel = null;
    }
    else if (trimmed.startsWith('[PANEL')) {
      if (currentPanel && currentPage) currentPage.panels.push(currentPanel);
      currentPanel = { visual: '', dialogue: '' };
    }
    else if (trimmed.startsWith('VISUAL:')) {
      if (currentPanel) currentPanel.visual = trimmed.replace('VISUAL:', '').trim();
    }
    else if (trimmed.startsWith('DIALOGUE:')) {
      if (currentPanel) currentPanel.dialogue = trimmed.replace('DIALOGUE:', '').trim();
    }
  }
  
  if (currentPanel && currentPage) currentPage.panels.push(currentPanel);
  if (currentPage) pages.push(currentPage);
  
  // Validation rules
  let totalPanels = 0;
  let totalDialogueLines = 0;
  
  for (const page of pages) {
    if (page.panels.length > 3) {
      errors.push(`Page ${page.number}: ${page.panels.length} panels. Max 3.`);
    }
    
    let pageDialogue = 0;
    for (const panel of page.panels) {
      totalPanels++;
      if (panel.dialogue) {
        const lines = panel.dialogue.split('\n').filter(l => l.trim());
        pageDialogue += lines.length;
        totalDialogueLines += lines.length;
      }
    }
    
    if (pageDialogue > 2) {
      errors.push(`Page ${page.number}: ${pageDialogue} dialogue lines. Max 2.`);
    }
  }
  
  return {
    valid: errors.length === 0,
    pages: pages.length,
    panels: totalPanels,
    dialogueLines: totalDialogueLines,
    errors: errors
  };
}

module.exports = { validateGGC };