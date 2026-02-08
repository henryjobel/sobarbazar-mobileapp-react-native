#!/usr/bin/env node

/**
 * Color Migration Script
 * Replaces hardcoded color values with theme imports
 *
 * Usage: node scripts/migrate-colors.js
 */

const fs = require('fs');
const path = require('path');

// Color mappings (hex -> theme path)
const COLOR_MAPPINGS = {
  '#299e60': 'colors.primary.main',
  '#22C55E': 'colors.success.main',
  '#FF7D00': 'colors.secondary.main',
  '#EF4444': 'colors.danger.main',
  '#DC2626': 'colors.danger.main',
  '#EAB308': 'colors.warning.main',
  '#FF9F29': 'colors.warning.light',
  '#3B82F6': 'colors.info.main',
  '#F3FAF2': 'colors.background.one',
  '#FFFBF4': 'colors.background.two',
  '#F1F1F1': 'colors.background.three',
};

// Directories to search
const DIRECTORIES = ['app', 'components', 'context', 'hooks'];

// File extensions to process
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return EXTENSIONS.includes(ext) && !filePath.includes('node_modules');
}

/**
 * Add import to file if not present
 */
function addThemeImport(content) {
  if (content.includes("from '@/src/theme'") || content.includes('from "@/src/theme"')) {
    return content;
  }

  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, "import { colors } from '@/src/theme';");
    return lines.join('\n');
  }

  // No imports found, add at the beginning
  return "import { colors } from '@/src/theme';\n\n" + content;
}

/**
 * Replace colors in file
 */
function replaceColorsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let replacements = 0;

  // Replace each color
  for (const [hex, themePath] of Object.entries(COLOR_MAPPINGS)) {
    // Case-insensitive regex for hex colors
    const regex = new RegExp(hex.replace('#', '#?'), 'gi');
    const matches = content.match(regex);

    if (matches) {
      // Replace color values
      content = content.replace(regex, `{${themePath}}`);
      replacements += matches.length;
      modified = true;
    }
  }

  if (modified) {
    // Add theme import
    content = addThemeImport(content);

    // Write file
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFiles++;
    totalReplacements += replacements;

    console.log(`✅ ${filePath} - ${replacements} replacements`);
  }

  totalFiles++;
}

/**
 * Process directory recursively
 */
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
      processDirectory(filePath);
    } else if (stat.isFile() && shouldProcessFile(filePath)) {
      try {
        replaceColorsInFile(filePath);
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }
  });
}

/**
 * Main execution
 */
function main() {
  console.log('🎨 Starting color migration...\n');

  const rootDir = path.resolve(__dirname, '..');

  DIRECTORIES.forEach(dir => {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath)) {
      console.log(`📁 Processing ${dir}/...`);
      processDirectory(dirPath);
    }
  });

  console.log('\n✨ Migration complete!');
  console.log(`📊 Stats:`);
  console.log(`   - Total files scanned: ${totalFiles}`);
  console.log(`   - Files modified: ${modifiedFiles}`);
  console.log(`   - Total replacements: ${totalReplacements}`);

  if (modifiedFiles > 0) {
    console.log('\n⚠️  Please review the changes and test thoroughly!');
    console.log('💡 Tip: Use git diff to review changes before committing');
  }
}

main();
