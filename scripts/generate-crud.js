#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

class CrudGenerator {
  constructor(moduleName, options = {}) {
    this.moduleName = moduleName;
    this.options = options;
    this.setupVariables();
    this.stubsPath = path.join(__dirname, 'stubs');
    this.outputPath = path.join(
      __dirname,
      '..',
      'src',
      'modules',
      this.pluralKebab,
    );

    // Parse specific components to generate
    this.specificComponents = this.parseSpecificComponents();
    this.excludedComponents = this.parseExcludedComponents();
    this.additionalEntities = this.parseAdditionalEntities();
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

  // Parse specific components from options
  parseSpecificComponents() {
    if (!this.options.specific) {
      return null; // Generate all components
    }

    const validComponents = [
      'entity',
      'dto',
      'command',
      'query',
      'handler',
      'controller',
      'module',
    ];

    const components = this.options.specific
      .split(',')
      .map((c) => c.trim().toLowerCase());

    // Validate components
    for (const component of components) {
      if (!validComponents.includes(component)) {
        console.error(`❌ Invalid component: ${component}`);
        console.error(`Valid components: ${validComponents.join(', ')}`);
        process.exit(1);
      }
    }

    return components;
  }

  // Parse excluded components from options
  parseExcludedComponents() {
    if (!this.options.exclude) {
      return [];
    }

    const validComponents = [
      'entity',
      'dto',
      'command',
      'query',
      'handler',
      'controller',
      'module',
    ];

    const components = this.options.exclude
      .split(',')
      .map((c) => c.trim().toLowerCase());

    // Validate components
    for (const component of components) {
      if (!validComponents.includes(component)) {
        console.error(`❌ Invalid excluded component: ${component}`);
        console.error(`Valid components: ${validComponents.join(', ')}`);
        process.exit(1);
      }
    }

    return components;
  }

  // Parse additional entities from options
  parseAdditionalEntities() {
    if (!this.options.new) {
      return [];
    }

    return this.options.new.split(',').map((entity) => entity.trim());
  }

  // Check if component should be generated
  shouldGenerate(componentType) {
    // Check if component is excluded
    if (this.excludedComponents.includes(componentType)) {
      return false;
    }

    // If specific components are defined, only generate those
    if (this.specificComponents) {
      return this.specificComponents.includes(componentType);
    }

    // Generate all by default (unless excluded)
    return true;
  }

  // Generate additional entities
  generateAdditionalEntity(entityName) {
    console.log(`\nGenerating additional entity: ${entityName}`);

    // Create a temporary generator for the additional entity
    const tempGenerator = new CrudGenerator(entityName, this.options);
    tempGenerator.outputPath = this.outputPath; // Use same module directory

    let localGeneratedCount = 0;
    let localSkippedCount = 0;

    const generateAndTrackLocal = (stubName, outputPath) => {
      const result = tempGenerator.generateFile(stubName, outputPath);
      if (result) {
        localGeneratedCount++;
      } else {
        localSkippedCount++;
      }
    };

    // Generate only entity and DTOs for additional entities
    if (this.shouldGenerate('entity')) {
      generateAndTrackLocal(
        'entity',
        path.join(
          this.outputPath,
          'entities',
          `${tempGenerator.singularKebab}.entity.ts`,
        ),
      );
    }

    if (this.shouldGenerate('dto')) {
      generateAndTrackLocal(
        'create-dto',
        path.join(
          this.outputPath,
          'dto',
          `create-${tempGenerator.singularKebab}.dto.ts`,
        ),
      );
      generateAndTrackLocal(
        'update-dto',
        path.join(
          this.outputPath,
          'dto',
          `update-${tempGenerator.singularKebab}.dto.ts`,
        ),
      );
      generateAndTrackLocal(
        'dto',
        path.join(
          this.outputPath,
          'dto',
          `${tempGenerator.singularKebab}.dto.ts`,
        ),
      );
      generateAndTrackLocal(
        'page-dto',
        path.join(
          this.outputPath,
          'dto',
          `page-${tempGenerator.singularKebab}.dto.ts`,
        ),
      );
    }

    return { generated: localGeneratedCount, skipped: localSkippedCount };
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
      return false;
    }

    // Check if file already exists
    if (fs.existsSync(outputPath)) {
      if (this.options.force) {
        console.log(
          `🔄 Overwriting: ${path.relative(this.outputPath, outputPath)}`,
        );
      } else {
        console.log(
          `⚠️  File already exists: ${path.relative(this.outputPath, outputPath)}`,
        );
        return false;
      }
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
    console.log(`✅ Generated: ${path.relative(this.outputPath, outputPath)}`);
    return true;
  }

  // Generate all CRUD files
  generate() {
    console.log(`Generating CRUD module: ${this.moduleName}`);
    console.log(`Output directory: ${this.outputPath}`);

    // Validate conflicting options
    if (this.specificComponents && this.excludedComponents.length > 0) {
      console.error(
        '❌ Cannot use both --specific and --exclude options together',
      );
      process.exit(1);
    }

    // Track generation results
    let generatedCount = 0;
    let skippedCount = 0;

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

    // Helper function to track file generation
    const generateAndTrack = (stubName, outputPath) => {
      const result = this.generateFile(stubName, outputPath);
      if (result) {
        generatedCount++;
      } else {
        skippedCount++;
      }
    };

    // Generate entity
    if (this.shouldGenerate('entity')) {
      generateAndTrack(
        'entity',
        path.join(
          this.outputPath,
          'entities',
          `${this.singularKebab}.entity.ts`,
        ),
      );
    }

    // Generate DTOs
    if (this.shouldGenerate('dto')) {
      generateAndTrack(
        'create-dto',
        path.join(
          this.outputPath,
          'dto',
          `create-${this.singularKebab}.dto.ts`,
        ),
      );
      generateAndTrack(
        'update-dto',
        path.join(
          this.outputPath,
          'dto',
          `update-${this.singularKebab}.dto.ts`,
        ),
      );
      generateAndTrack(
        'dto',
        path.join(this.outputPath, 'dto', `${this.singularKebab}.dto.ts`),
      );
      generateAndTrack(
        'page-dto',
        path.join(this.outputPath, 'dto', `page-${this.singularKebab}.dto.ts`),
      );
    }

    // Generate commands
    if (this.shouldGenerate('command')) {
      generateAndTrack(
        'create-command',
        path.join(
          this.outputPath,
          'commands',
          'imp',
          `create-${this.singularKebab}.command.ts`,
        ),
      );
      generateAndTrack(
        'update-command',
        path.join(
          this.outputPath,
          'commands',
          'imp',
          `update-${this.singularKebab}.command.ts`,
        ),
      );
      generateAndTrack(
        'delete-command',
        path.join(
          this.outputPath,
          'commands',
          'imp',
          `delete-${this.singularKebab}.command.ts`,
        ),
      );
    }

    // Generate command handlers
    if (this.shouldGenerate('handler')) {
      generateAndTrack(
        'create-handler',
        path.join(
          this.outputPath,
          'commands',
          'handlers',
          `create-${this.singularKebab}.handler.ts`,
        ),
      );
      generateAndTrack(
        'update-handler',
        path.join(
          this.outputPath,
          'commands',
          'handlers',
          `update-${this.singularKebab}.handler.ts`,
        ),
      );
      generateAndTrack(
        'delete-handler',
        path.join(
          this.outputPath,
          'commands',
          'handlers',
          `delete-${this.singularKebab}.handler.ts`,
        ),
      );
    }

    // Generate queries
    if (this.shouldGenerate('query')) {
      generateAndTrack(
        'get-all-query',
        path.join(
          this.outputPath,
          'queries',
          'imp',
          `get-${this.pluralKebab}.query.ts`,
        ),
      );
      generateAndTrack(
        'get-one-query',
        path.join(
          this.outputPath,
          'queries',
          'imp',
          `get-${this.singularKebab}.query.ts`,
        ),
      );
    }

    // Generate query handlers
    if (this.shouldGenerate('handler')) {
      generateAndTrack(
        'get-all-handler',
        path.join(
          this.outputPath,
          'queries',
          'handlers',
          `get-${this.pluralKebab}.handler.ts`,
        ),
      );
      generateAndTrack(
        'get-one-handler',
        path.join(
          this.outputPath,
          'queries',
          'handlers',
          `get-${this.singularKebab}.handler.ts`,
        ),
      );
    }

    // Generate controller
    if (this.shouldGenerate('controller')) {
      generateAndTrack(
        'controller',
        path.join(this.outputPath, `${this.pluralKebab}.controller.ts`),
      );
    }

    // Generate module
    if (this.shouldGenerate('module')) {
      generateAndTrack(
        'module',
        path.join(this.outputPath, `${this.pluralKebab}.module.ts`),
      );
    }

    // Generate additional entities
    for (const entityName of this.additionalEntities) {
      const result = this.generateAdditionalEntity(entityName);
      generatedCount += result.generated;
      skippedCount += result.skipped;
    }

    // Generate migration
    // const migrationPath = path.join(
    //   __dirname,
    //   '..',
    //   'src',
    //   'db',
    //   'migrations',
    //   `${this.timestamp}-create-${this.pluralKebab}-table.ts`,
    // );
    // generateAndTrack('migration', migrationPath);

    // Summary
    console.log('\n' + '='.repeat(50));
    if (generatedCount > 0) {
      console.log(
        `✅ CRUD module '${this.moduleName}' generated successfully!`,
      );
      console.log(`📁 Generated ${generatedCount} files`);
      if (this.options.force && skippedCount === 0) {
        console.log(`🔄 Some files may have been overwritten`);
      }
    }

    if (skippedCount > 0) {
      console.log(`⚠️  Skipped ${skippedCount} existing files`);
      if (!this.options.force) {
        console.log(`💡 Use --force to overwrite existing files`);
      }
    }

    if (generatedCount === 0) {
      console.log(`⚠️  No files were generated. Module may already exist.`);
      if (!this.options.force) {
        console.log(`💡 Use --force to overwrite existing files`);
      }
    }

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
  console.error('Usage: node generate-crud.js <module-name> [options]');
  console.error('Example: node generate-crud.js companies');
  console.error('');
  console.error('Options:');
  console.error(
    '  --specific=component1,component2  Generate only specific components',
  );
  console.error(
    '  --exclude=component1,component2   Exclude specific components',
  );
  console.error(
    '  --new=Entity1,Entity2            Generate additional entities',
  );
  console.error('  --force                          Overwrite existing files');
  console.error('');
  console.error(
    'Components: entity, dto, command, query, handler, controller, module',
  );
  console.error('');
  console.error('Examples:');
  console.error('  node generate-crud.js company --specific=dto,query');
  console.error('  node generate-crud.js company --exclude=handler,controller');
  console.error('  node generate-crud.js company --force');
  console.error(
    '  node generate-crud.js company --new=CompanyCategory,CompanyType',
  );
  console.error(
    '  node generate-crud.js company --exclude=module --new=CompanyCategory',
  );
  console.error('  node generate-crud.js company --specific=dto --force');
  process.exit(1);
}

// Parse arguments
const moduleName = args[0];
const options = {};

for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--specific=')) {
    options.specific = arg.split('=')[1];
  } else if (arg.startsWith('--exclude=')) {
    options.exclude = arg.split('=')[1];
  } else if (arg.startsWith('--new=')) {
    options.new = arg.split('=')[1];
  } else if (arg === '--force') {
    options.force = true;
  }
}

const generator = new CrudGenerator(moduleName, options);
generator.generate();
