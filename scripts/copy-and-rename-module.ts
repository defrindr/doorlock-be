/**
 * TypeScript Module Copier for NestJS
 * Copies and renames modules with automatic content replacement
 *
 * Usage: npx ts-node scripts/copy-and-rename-module.ts <source> <target> [base_path]
 * Example: npx ts-node scripts/copy-and-rename-module.ts guests employees
 * Example: npx ts-node scripts/copy-and-rename-module.ts guests:guest employees:employee
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

class Logger {
  static info(message: string): void {
    console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
  }

  static success(message: string): void {
    console.log(`${colors.green}✅ ${message}${colors.reset}`);
  }

  static warning(message: string): void {
    console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
  }

  static error(message: string): void {
    console.log(`${colors.red}❌ ${message}${colors.reset}`);
  }
}

interface ModuleNames {
  plural: string;
  singular: string;
}

interface ReplacementMap {
  [key: string]: string;
}

class ModuleCopier {
  private sourceNames: ModuleNames;
  private targetNames: ModuleNames;
  private basePath: string;
  private sourcePath: string;
  private targetPath: string;
  private replacements: ReplacementMap = {};

  constructor(
    sourceModule: string,
    targetModule: string,
    basePath = 'src/modules/identities',
  ) {
    this.sourceNames = this.parseModuleNames(sourceModule);
    this.targetNames = this.parseModuleNames(targetModule);
    this.basePath = basePath;
    this.sourcePath = path.join(this.basePath, this.sourceNames.plural);
    this.targetPath = path.join(this.basePath, this.targetNames.plural);

    this.generateReplacements();
  }

  private parseModuleNames(moduleInput: string): ModuleNames {
    // Check if input contains both singular and plural (format: "plural:singular")
    if (moduleInput.includes(':')) {
      const [plural, singular] = moduleInput.split(':');
      return { plural: plural.trim(), singular: singular.trim() };
    }

    // If only one name provided, assume it's plural and try to derive singular
    const plural = moduleInput.trim();
    const singular = this.deriveSingular(plural);

    return { plural, singular };
  }

  private deriveSingular(plural: string): string {
    // Simple English pluralization rules (reverse)
    if (plural.endsWith('ies')) {
      return plural.slice(0, -3) + 'y';
    }
    if (plural.endsWith('oes')) {
      return plural.slice(0, -2);
    }
    if (
      plural.endsWith('ses') ||
      plural.endsWith('ches') ||
      plural.endsWith('shes')
    ) {
      return plural.slice(0, -2);
    }
    if (plural.endsWith('s') && !plural.endsWith('ss')) {
      return plural.slice(0, -1);
    }

    // If no rule applies, assume it's already singular or return as-is
    return plural;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]/)
      .map((word) => this.capitalize(word))
      .join('');
  }

  private toSnakeCase(str: string): string {
    return str
      .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      .replace(/^_/, '');
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
      .replace(/^-/, '');
  }

  private generateReplacements(): void {
    const source = this.sourceNames;
    const target = this.targetNames;

    // Plural forms (main module names)
    this.replacements[source.plural] = target.plural;
    this.replacements[this.capitalize(source.plural)] = this.capitalize(
      target.plural,
    );
    this.replacements[source.plural.toUpperCase()] =
      target.plural.toUpperCase();
    this.replacements[this.toPascalCase(source.plural)] = this.toPascalCase(
      target.plural,
    );
    this.replacements[this.toSnakeCase(source.plural)] = this.toSnakeCase(
      target.plural,
    );
    this.replacements[this.toKebabCase(source.plural)] = this.toKebabCase(
      target.plural,
    );

    // Singular forms (entity names, etc.)
    this.replacements[source.singular] = target.singular;
    this.replacements[this.capitalize(source.singular)] = this.capitalize(
      target.singular,
    );
    this.replacements[source.singular.toUpperCase()] =
      target.singular.toUpperCase();
    this.replacements[this.toPascalCase(source.singular)] = this.toPascalCase(
      target.singular,
    );
    this.replacements[this.toSnakeCase(source.singular)] = this.toSnakeCase(
      target.singular,
    );
    this.replacements[this.toKebabCase(source.singular)] = this.toKebabCase(
      target.singular,
    );

    // Database table naming conventions (usually plural)
    this.replacements[`account_${source.plural}`] = `account_${target.plural}`;
    this.replacements[`account-${source.plural}`] = `account-${target.plural}`;

    // Special TypeORM entity naming (usually singular)
    this.replacements[`${source.singular}_entity`] =
      `${target.singular}_entity`;
    this.replacements[`${source.singular}-entity`] =
      `${target.singular}-entity`;

    // API route patterns (usually plural)
    this.replacements[`/${source.plural}`] = `/${target.plural}`;
    this.replacements[`/${source.plural}/`] = `/${target.plural}/`;

    // Common combinations
    this.replacements[`${source.plural}Service`] = `${target.plural}Service`;
    this.replacements[`${source.plural}Controller`] =
      `${target.plural}Controller`;
    this.replacements[`${source.plural}Module`] = `${target.plural}Module`;
    this.replacements[`${this.capitalize(source.singular)}Entity`] =
      `${this.capitalize(target.singular)}Entity`;
  }

  private validatePaths(): void {
    if (!fs.existsSync(this.sourcePath)) {
      Logger.error(`Source module not found: ${this.sourcePath}`);
      process.exit(1);
    }

    if (fs.existsSync(this.targetPath)) {
      Logger.error(`Target module already exists: ${this.targetPath}`);
      process.exit(1);
    }
  }

  private copyDirectory(): void {
    Logger.info('Copying module directory...');
    try {
      execSync(`cp -r "${this.sourcePath}" "${this.targetPath}"`);
      Logger.success('Module copied successfully');
    } catch (error) {
      Logger.error(`Failed to copy directory: ${error}`);
      process.exit(1);
    }
  }

  private getAllFiles(dir: string): string[] {
    const files: string[] = [];

    const readDir = (currentDir: string): void => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          readDir(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    };

    readDir(dir);
    return files;
  }

  private getAllDirectories(dir: string): string[] {
    const directories: string[] = [];

    const readDir = (currentDir: string): void => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          directories.push(fullPath);
          readDir(fullPath);
        }
      }
    };

    readDir(dir);
    return directories.sort().reverse(); // Reverse for bottom-up renaming
  }

  private renameFiles(): void {
    Logger.info('Renaming files and directories...');

    // Rename files first
    const files = this.getAllFiles(this.targetPath);

    for (const file of files) {
      const dir = path.dirname(file);
      const basename = path.basename(file);
      let newName = basename;

      // Apply replacements to filename
      for (const [oldStr, newStr] of Object.entries(this.replacements)) {
        newName = newName.replace(new RegExp(oldStr, 'g'), newStr);
      }

      if (newName !== basename) {
        const newPath = path.join(dir, newName);
        fs.renameSync(file, newPath);
        Logger.success(`Renamed: ${basename} → ${newName}`);
      }
    }

    // Rename directories (bottom-up to avoid path conflicts)
    const directories = this.getAllDirectories(this.targetPath);

    for (const directory of directories) {
      const parentDir = path.dirname(directory);
      const basename = path.basename(directory);
      let newName = basename;

      // Apply replacements to directory name
      for (const [oldStr, newStr] of Object.entries(this.replacements)) {
        newName = newName.replace(new RegExp(oldStr, 'g'), newStr);
      }

      if (newName !== basename) {
        const newPath = path.join(parentDir, newName);
        fs.renameSync(directory, newPath);
        Logger.success(`Renamed directory: ${basename} → ${newName}`);
      }
    }
  }

  private replaceContent(): void {
    Logger.info('Replacing content in files...');

    const files = this.getAllFiles(this.targetPath);
    const supportedExtensions = ['.ts', '.js', '.json', '.md', '.sql'];

    for (const file of files) {
      const ext = path.extname(file);

      if (!supportedExtensions.includes(ext)) {
        continue;
      }

      try {
        let content = fs.readFileSync(file, 'utf8');
        let changed = false;

        for (const [oldStr, newStr] of Object.entries(this.replacements)) {
          const regex = new RegExp(oldStr, 'g');
          if (regex.test(content)) {
            content = content.replace(regex, newStr);
            changed = true;
          }
        }

        if (changed) {
          fs.writeFileSync(file, content, 'utf8');
          Logger.success(`Updated content: ${path.basename(file)}`);
        }
      } catch (error) {
        Logger.warning(`Failed to process file: ${file} - ${error}`);
      }
    }
  }

  private printNextSteps(): void {
    console.log('');
    Logger.info('📋 Next Steps:');
    console.log(
      '1. Review the generated files and make manual adjustments if needed',
    );
    console.log('2. Update module imports in the main module files');
    console.log('3. Add the new module to your app.module.ts');
    console.log('4. Create/update database migrations if needed');
    console.log('5. Update API routes and documentation');
    console.log(
      `6. Test the new ${this.targetNames.plural} module functionality`,
    );

    console.log('');
    Logger.info('🔍 Files to review:');
    console.log(`- ${this.targetPath}/entities/`);
    console.log(`- ${this.targetPath}/dto/`);
    console.log(`- ${this.targetPath}/*.module.ts`);

    console.log('');
    Logger.info(`🚀 Ready to use your new ${this.targetNames.plural} module!`);
  }

  public execute(): void {
    Logger.info('Starting module copy and rename process...');
    Logger.info(
      `Source: ${this.sourceNames.plural} (${this.sourceNames.singular})`,
    );
    Logger.info(
      `Target: ${this.targetNames.plural} (${this.targetNames.singular})`,
    );
    Logger.info(`Base Path: ${this.basePath}`);

    this.validatePaths();
    this.copyDirectory();
    this.renameFiles();
    this.replaceContent();

    Logger.success(`Module ${this.targetNames.plural} created successfully!`);
    this.printNextSteps();
  }
}

// Main execution
const main = (): void => {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    Logger.error(
      'Usage: npx ts-node copy-and-rename-module.ts <source> <target> [base_path]',
    );
    Logger.error('Examples:');
    Logger.error('  npx ts-node copy-and-rename-module.ts guests employees');
    Logger.error(
      '  npx ts-node copy-and-rename-module.ts guests:guest employees:employee',
    );
    Logger.error(
      '  npx ts-node copy-and-rename-module.ts guests employees src/modules/identities',
    );
    Logger.info('');
    Logger.info('Format: <plural>:<singular> or just <plural>');
    Logger.info('If only plural provided, singular will be auto-derived');
    process.exit(1);
  }

  const [sourceModule, targetModule, basePath] = args;

  try {
    const copier = new ModuleCopier(sourceModule, targetModule, basePath);
    copier.execute();
  } catch (error) {
    Logger.error(`Execution failed: ${error}`);
    process.exit(1);
  }
};

// Execute if called directly
if (require.main === module) {
  main();
}

export { ModuleCopier };
