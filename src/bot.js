/**
 * GGC Discord Bot
 * Validates .ggc files in Discord messages
 */

const { validateGGC } = require('./utils/ggc-parser');

// This file will run on Replit or your server
// The actual bot setup requires a DISCORD_TOKEN

async function handleValidation(messageContent) {
  // Extract code block from message
  const codeBlock = messageContent.match(/```(?:ggc)?\n([\s\S]*?)```/);
  
  if (!codeBlock) {
    return null;
  }
  
  const ggcContent = codeBlock[1];
  const result = validateGGC(ggcContent);
  
  return result;
}

// Export for the main bot file
module.exports = { handleValidation };