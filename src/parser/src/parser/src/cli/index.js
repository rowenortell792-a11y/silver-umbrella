#!/usr/bin/env node

/**
 * GGC Compiler CLI - Command Line Interface
 * Version: 1.0.0
 * 
 * Usage: node src/cli/index.js <path/to/file.ggc>
 * 
 * Validates .ggc files against the GGC Literary Format Bible
 * Returns exit code 0 if valid, 1 if errors found
 */

const fs = require('fs');
const path = require('path');
const { GGCLexer } = require('../parser/lexer');
const { GGCValidator } = require('../parser/validator');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function printBanner() {
  console.log(`${colors.cyan}${colors.bold}`);
  console.log('╔═══════════════════════════════════╗');
  console.log('║     GGC COMPILER v1.0             ║');
  console.log('║     Literary Format Validator     ║');
  console.log('╚═══════════════════════════════════╝');
  console.log(`${colors.reset}`);
}

function printValidationResult(result) {
  if (result.errors.length === 0) {
    console.log(`${colors.green}✅ VALIDATION PASSED${colors.reset}`);
    console.log(`   No errors found.`);
  } else {
    console.log(`${colors.red}❌ VALIDATION FAILED${colors.reset}`);
    console.log(`   ${result.errors.length} error(s) found:\n`);
    
    result.errors.forEach(err => {
      console.log(`${colors.red}   ✗ Page ${err.page}: ${err.message}${colors.reset}`);
    });
  }
  
  if (result.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠️  WARNINGS:${colors.reset}`);
    result.warnings.forEach(warning => {
      console.log(`${colors.yellow}   ! Page ${warning.page}: ${warning.message}${colors.reset}`);
    });
  }
}

function printSummary(tokens, result) {
  const totalPages = tokens.length;
  const totalPanels = tokens.reduce((sum, page) => sum + page.panels.length, 0);
  const totalDialogue = tokens.reduce((sum, page) => {
    let pageDialogue = 0;
    page.panels.forEach(panel => {
      if (panel.dialogue) {
        pageDialogue += panel.dialogue.split('\n').filter(l => l.trim()).length;
      }
    });
    return sum + pageDialogue;
  }, 0);
  
  console.log(`\n${colors.cyan}📊 SUMMARY:${colors.reset}`);
  console.log(`   Pages: ${totalPages}`);
  console.log(`   Panels: ${totalPanels}`);
  console.log(`   Dialogue Lines: ${totalDialogue}`);
  console.log(`   Zero-Dialogue Pages: ${result.warnings.filter(w => w.rule === 'ZERO_DIALOGUE_REQUIRED').length > 0 ? 'Check warnings' : 'OK'}`);
}

// Main execution
const filePath = process.argv[2];

printBanner();

if (!filePath) {
  console.log(`${colors.yellow}Usage: node src/cli/index.js <path/to/file.ggc>${colors.reset}`);
  console.log(`\nExample: node src/cli/index.js examples/page-01.ggc`);
  process.exit(1);
}

const resolvedPath = path.resolve(filePath);

if (!fs.existsSync(resolvedPath)) {
  console.log(`${colors.red}❌ File not found: ${resolvedPath}${colors.reset}`);
  process.exit(1);
}

try {
  const content = fs.readFileSync(resolvedPath, 'utf-8');
  const lexer = new GGCLexer(content);
  const tokens = lexer.tokenize();
  const validator = new GGCValidator(tokens);
  const result = validator.validate();
  
  printValidationResult(result);
  printSummary(tokens, result);
  
  // Exit with error code if validation failed
  if (result.errors.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
} catch (error) {
  console.log(`${colors.red}❌ PARSING ERROR: ${error.message}${colors.reset}`);
  process.exit(1);
}
