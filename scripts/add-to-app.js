#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Helper script to add generated module to app.module.ts
function addModuleToApp(moduleName) {
  const appModulePath = join(__dirname, '..', 'src', 'app.module.ts');

  if (!existsSync(appModulePath)) {
    console.error('app.module.ts not found!');
    return;
  }

  // Convert to proper case
  const singularPascal =
    moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const pluralKebab = pluralize(moduleName);
  const pluralPascal = pluralize(singularPascal);

  let content = readFileSync(appModulePath, 'utf8');

  // Add import
  const importLine = `import { ${pluralPascal}Module } from './modules/${pluralKebab}/${pluralKebab}.module';`;

  // Find last import line and add after it
  const importRegex = /^import.*from.*;\s*$/gm;
  let lastImportIndex = -1;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    lastImportIndex = match.index + match[0].length;
  }

  if (lastImportIndex > -1) {
    content =
      content.slice(0, lastImportIndex) +
      '\\n' +
      importLine +
      content.slice(lastImportIndex);
  }

  // Add to imports array
  const importsRegex = /imports:\s*\[([^\]]*)\]/;
  const importsMatch = content.match(importsRegex);

  if (importsMatch) {
    const currentImports = importsMatch[1];
    const newImports = currentImports.trim()
      ? `${currentImports}, ${pluralPascal}Module`
      : pluralPascal + 'Module';

    content = content.replace(importsRegex, `imports: [${newImports}]`);
  }

  writeFileSync(appModulePath, content);
  console.log(`✅ Added ${pluralPascal}Module to app.module.ts`);
}

function pluralize(word) {
  const irregulars = {
    company: 'companies',
    person: 'people',
    child: 'children',
  };

  const lowerWord = word.toLowerCase();
  if (irregulars[lowerWord]) {
    return irregulars[lowerWord];
  }

  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  }
  if (
    word.endsWith('s') ||
    word.endsWith('sh') ||
    word.endsWith('ch') ||
    word.endsWith('x') ||
    word.endsWith('z')
  ) {
    return word + 'es';
  }
  return word + 's';
}

// CLI usage
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node add-to-app.js <module-name>');
  process.exit(1);
}

addModuleToApp(args[0]);
