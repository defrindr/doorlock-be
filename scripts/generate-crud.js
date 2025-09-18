#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';

class CrudGenerator {
  constructor(moduleName) {
    this.moduleName = moduleName;
    this.setupVariables();
    this.stubsPath = join(__dirname, 'stubs');
    this.outputPath = join(__dirname, '..', 'src', 'modules', this.pluralKebab);
  }

  setupVariables() {
    // Convert module name to different cases
    this.singularKebab = this.toKebabCase(this.moduleName);
    this.pluralKebab = this.pluralize(this.singularKebab);

    this.singularCamel = this.toCamelCase(this.moduleName);
    this.pluralCamel = this.pluralize(this.singularCamel);

    this.singularPascal = this.toPascalCase(this.moduleName);
    this.pluralPascal = this.pluralize(this.singularPascal);

    this.singularSnake = this.toSnakeCase(this.moduleName);
    this.pluralSnake = this.pluralize(this.singularSnake);

    this.pluralUpper = this.pluralSnake.toUpperCase();

    this.timestamp = Date.now();
  }

  // Case conversion utilities
  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  toPascalCase(str) {
    return this.toCamelCase(str).replace(/^[a-z]/, (g) => g.toUpperCase());
  }

  toKebabCase(str) {
    return str
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  }

  toSnakeCase(str) {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  // Simple pluralization
  pluralize(word) {
    // Handle special cases
    const irregulars = {
      company: 'companies',
      person: 'people',
      child: 'children',
      mouse: 'mice',
      goose: 'geese',
    };

    if (irregulars[word.toLowerCase()]) {
      return irregulars[word.toLowerCase()];
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

  // Replace placeholders in template content
  replacePlaceholders(content) {
    return content
      .replace(/{{SINGULAR_KEBAB}}/g, this.singularKebab)
      .replace(/{{PLURAL_KEBAB}}/g, this.pluralKebab)
      .replace(/{{SINGULAR_CAMEL}}/g, this.singularCamel)
      .replace(/{{PLURAL_CAMEL}}/g, this.pluralCamel)
      .replace(/{{SINGULAR_PASCAL}}/g, this.singularPascal)
      .replace(/{{PLURAL_PASCAL}}/g, this.pluralPascal)
      .replace(/{{SINGULAR_SNAKE}}/g, this.singularSnake)
      .replace(/{{PLURAL_SNAKE}}/g, this.pluralSnake)
      .replace(/{{PLURAL_UPPER}}/g, this.pluralUpper)
      .replace(/{{TIMESTAMP}}/g, this.timestamp);
  }

  // Create directory if it doesn't exist
  ensureDirectoryExists(dirPath) {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
  }

  // Generate file from stub
  generateFile(stubName, outputPath, customReplacements = {}) {
    const stubPath = join(this.stubsPath, `${stubName}.stub`);

    if (!existsSync(stubPath)) {
      console.error(`Stub file not found: ${stubPath}`);
      return;
    }

    let content = readFileSync(stubPath, 'utf8');

    // Apply standard replacements
    content = this.replacePlaceholders(content);

    // Apply custom replacements
    for (const [key, value] of Object.entries(customReplacements)) {
      content = content.replace(new RegExp(key, 'g'), value);
    }

    this.ensureDirectoryExists(dirname(outputPath));
    writeFileSync(outputPath, content);
    console.log(`Generated: ${outputPath}`);
  }

  // Generate all CRUD files
  generate() {
    console.log(`Generating CRUD module: ${this.moduleName}`);
    console.log(`Output directory: ${this.outputPath}`);

    // Create main directories
    this.ensureDirectoryExists(this.outputPath);
    this.ensureDirectoryExists(join(this.outputPath, 'entities'));
    this.ensureDirectoryExists(join(this.outputPath, 'dto'));
    this.ensureDirectoryExists(join(this.outputPath, 'commands', 'imp'));
    this.ensureDirectoryExists(join(this.outputPath, 'commands', 'handlers'));
    this.ensureDirectoryExists(join(this.outputPath, 'queries', 'imp'));
    this.ensureDirectoryExists(join(this.outputPath, 'queries', 'handlers'));

    // Generate entity
    this.generateFile(
      'entity',
      join(this.outputPath, 'entities', `${this.singularKebab}.entity.ts`),
    );

    // Generate DTOs
    this.generateFile(
      'create-dto',
      join(this.outputPath, 'dto', `create-${this.singularKebab}.dto.ts`),
    );
    this.generateFile(
      'update-dto',
      join(this.outputPath, 'dto', `update-${this.singularKebab}.dto.ts`),
    );
    this.generateFile(
      'dto',
      join(this.outputPath, 'dto', `${this.singularKebab}.dto.ts`),
    );
    this.generateFile(
      'page-dto',
      join(this.outputPath, 'dto', `page-${this.singularKebab}.dto.ts`),
    );

    // Generate commands
    this.generateFile(
      'create-command',
      join(
        this.outputPath,
        'commands',
        'imp',
        `create-${this.singularKebab}.command.ts`,
      ),
    );
    this.generateFile(
      'update-command',
      join(
        this.outputPath,
        'commands',
        'imp',
        `update-${this.singularKebab}.command.ts`,
      ),
    );
    this.generateFile(
      'delete-command',
      join(
        this.outputPath,
        'commands',
        'imp',
        `delete-${this.singularKebab}.command.ts`,
      ),
    );

    // Generate command handlers
    this.generateFile(
      'create-handler',
      join(
        this.outputPath,
        'commands',
        'handlers',
        `create-${this.singularKebab}.handler.ts`,
      ),
    );
    this.generateFile(
      'update-handler',
      join(
        this.outputPath,
        'commands',
        'handlers',
        `update-${this.singularKebab}.handler.ts`,
      ),
    );
    this.generateFile(
      'delete-handler',
      join(
        this.outputPath,
        'commands',
        'handlers',
        `delete-${this.singularKebab}.handler.ts`,
      ),
    );

    // Generate queries
    this.generateFile(
      'get-all-query',
      join(
        this.outputPath,
        'queries',
        'imp',
        `get-${this.pluralKebab}.query.ts`,
      ),
    );
    this.generateFile(
      'get-one-query',
      join(
        this.outputPath,
        'queries',
        'imp',
        `get-${this.singularKebab}.query.ts`,
      ),
    );

    // Generate query handlers
    this.generateFile(
      'get-all-handler',
      join(
        this.outputPath,
        'queries',
        'handlers',
        `get-${this.pluralKebab}.handler.ts`,
      ),
    );
    this.generateFile(
      'get-one-handler',
      join(
        this.outputPath,
        'queries',
        'handlers',
        `get-${this.singularKebab}.handler.ts`,
      ),
    );

    // Generate controller
    this.generateFile(
      'controller',
      join(this.outputPath, `${this.pluralKebab}.controller.ts`),
    );

    // Generate module
    this.generateFile(
      'module',
      join(this.outputPath, `${this.pluralKebab}.module.ts`),
    );

    // Generate migration
    const migrationPath = join(
      __dirname,
      '..',
      'src',
      'db',
      'migrations',
      `${this.timestamp}-create-${this.pluralKebab}-table.ts`,
    );
    this.generateFile('migration', migrationPath);

    console.log(
      `\\n✅ CRUD module '${this.moduleName}' generated successfully!`,
    );
    console.log(`\\nNext steps:`);
    console.log(
      `1. Add ${this.pluralPascal}Module to your app.module.ts imports`,
    );
    console.log(`2. Run migration: yarn typeorm -- migration:run`);
    console.log(
      `3. Update the entity fields as needed for your specific requirements`,
    );
  }
}

// CLI usage
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node generate-crud.js <module-name>');
  console.error('Example: node generate-crud.js companies');
  process.exit(1);
}

const moduleName = args[0];
const generator = new CrudGenerator(moduleName);
generator.generate();
