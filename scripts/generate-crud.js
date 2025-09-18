#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

class CrudGenerator {
  constructor(moduleName) {
    this.moduleName = moduleName;
    this.setupVariables();
    this.stubsPath = path.join(__dirname, 'stubs');
    this.outputPath = path.join(
      __dirname,
      '..',
      'src',
      'modules',
      this.pluralKebab,
    );
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

  // Simple pluralization with case preservation
  pluralize(word) {
    // Handle special cases - preserve case of first character
    const irregulars = {
      company: 'companies',
      person: 'people',
      child: 'children',
      mouse: 'mice',
      goose: 'geese',
    };

    const lowerWord = word.toLowerCase();
    if (irregulars[lowerWord]) {
      const pluralForm = irregulars[lowerWord];
      // Preserve the case of the first character from the original word
      if (word[0] === word[0].toUpperCase()) {
        return pluralForm.charAt(0).toUpperCase() + pluralForm.slice(1);
      }
      return pluralForm;
    }

    let result;
    if (word.toLowerCase().endsWith('y')) {
      result = word.slice(0, -1) + 'ies';
    } else if (
      word.toLowerCase().endsWith('s') ||
      word.toLowerCase().endsWith('sh') ||
      word.toLowerCase().endsWith('ch') ||
      word.toLowerCase().endsWith('x') ||
      word.toLowerCase().endsWith('z')
    ) {
      result = word + 'es';
    } else {
      result = word + 's';
    }

    return result;
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
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Generate file from stub
  generateFile(stubName, outputPath, customReplacements = {}) {
    const stubPath = path.join(this.stubsPath, `${stubName}.stub`);

    if (!fs.existsSync(stubPath)) {
      console.error(`Stub file not found: ${stubPath}`);
      return;
    }

    let content = fs.readFileSync(stubPath, 'utf8');

    // Apply standard replacements
    content = this.replacePlaceholders(content);

    // Apply custom replacements
    for (const [key, value] of Object.entries(customReplacements)) {
      content = content.replace(new RegExp(key, 'g'), value);
    }

    this.ensureDirectoryExists(path.dirname(outputPath));
    fs.writeFileSync(outputPath, content);
    // console.log(`Generated: ${outputPath}`);
  }

  // Generate all CRUD files
  generate() {
    console.log(`Generating CRUD module: ${this.moduleName}`);
    console.log(`Output directory: ${this.outputPath}`);

    // Create main directories
    this.ensureDirectoryExists(this.outputPath);
    this.ensureDirectoryExists(path.join(this.outputPath, 'entities'));
    this.ensureDirectoryExists(path.join(this.outputPath, 'dto'));
    this.ensureDirectoryExists(path.join(this.outputPath, 'commands', 'imp'));
    this.ensureDirectoryExists(
      path.join(this.outputPath, 'commands', 'handlers'),
    );
    this.ensureDirectoryExists(path.join(this.outputPath, 'queries', 'imp'));
    this.ensureDirectoryExists(
      path.join(this.outputPath, 'queries', 'handlers'),
    );

    // Generate entity
    this.generateFile(
      'entity',
      path.join(this.outputPath, 'entities', `${this.singularKebab}.entity.ts`),
    );

    // Generate DTOs
    this.generateFile(
      'create-dto',
      path.join(this.outputPath, 'dto', `create-${this.singularKebab}.dto.ts`),
    );
    this.generateFile(
      'update-dto',
      path.join(this.outputPath, 'dto', `update-${this.singularKebab}.dto.ts`),
    );
    this.generateFile(
      'dto',
      path.join(this.outputPath, 'dto', `${this.singularKebab}.dto.ts`),
    );
    this.generateFile(
      'page-dto',
      path.join(this.outputPath, 'dto', `page-${this.singularKebab}.dto.ts`),
    );

    // Generate commands
    this.generateFile(
      'create-command',
      path.join(
        this.outputPath,
        'commands',
        'imp',
        `create-${this.singularKebab}.command.ts`,
      ),
    );
    this.generateFile(
      'update-command',
      path.join(
        this.outputPath,
        'commands',
        'imp',
        `update-${this.singularKebab}.command.ts`,
      ),
    );
    this.generateFile(
      'delete-command',
      path.join(
        this.outputPath,
        'commands',
        'imp',
        `delete-${this.singularKebab}.command.ts`,
      ),
    );

    // Generate command handlers
    this.generateFile(
      'create-handler',
      path.join(
        this.outputPath,
        'commands',
        'handlers',
        `create-${this.singularKebab}.handler.ts`,
      ),
    );
    this.generateFile(
      'update-handler',
      path.join(
        this.outputPath,
        'commands',
        'handlers',
        `update-${this.singularKebab}.handler.ts`,
      ),
    );
    this.generateFile(
      'delete-handler',
      path.join(
        this.outputPath,
        'commands',
        'handlers',
        `delete-${this.singularKebab}.handler.ts`,
      ),
    );

    // Generate queries
    this.generateFile(
      'get-all-query',
      path.join(
        this.outputPath,
        'queries',
        'imp',
        `get-${this.pluralKebab}.query.ts`,
      ),
    );
    this.generateFile(
      'get-one-query',
      path.join(
        this.outputPath,
        'queries',
        'imp',
        `get-${this.singularKebab}.query.ts`,
      ),
    );

    // Generate query handlers
    this.generateFile(
      'get-all-handler',
      path.join(
        this.outputPath,
        'queries',
        'handlers',
        `get-${this.pluralKebab}.handler.ts`,
      ),
    );
    this.generateFile(
      'get-one-handler',
      path.join(
        this.outputPath,
        'queries',
        'handlers',
        `get-${this.singularKebab}.handler.ts`,
      ),
    );

    // Generate controller
    this.generateFile(
      'controller',
      path.join(this.outputPath, `${this.pluralKebab}.controller.ts`),
    );

    // Generate module
    this.generateFile(
      'module',
      path.join(this.outputPath, `${this.pluralKebab}.module.ts`),
    );

    // Generate migration
    // const migrationPath = path.join(
    //   __dirname,
    //   '..',
    //   'src',
    //   'db',
    //   'migrations',
    //   `${this.timestamp}-create-${this.pluralKebab}-table.ts`,
    // );
    // this.generateFile('migration', migrationPath);

    console.log(
      `\n✅ CRUD module '${this.moduleName}' generated successfully!`,
    );
    console.log(`\nNext steps:`);
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
