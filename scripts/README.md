# Module Copy and Rename Scripts

This directory contains scripts to help you duplicate and rename NestJS modules with automatic content replacement.

## Available Scripts

### 1. TypeScript Version (`copy-and-rename-module.ts`)

Modern TypeScript implementation with proper error handling and formatting.

**Usage:**
```bash
# From the backend directory
npx ts-node scripts/copy-and-rename-module.ts <source> <target> [base_path]

# Examples
npx ts-node scripts/copy-and-rename-module.ts guests employees
npx ts-node scripts/copy-and-rename-module.ts guests:guest employees:employee
npx ts-node scripts/copy-and-rename-module.ts guests employees src/modules/identities
```

**Format Options:**
- `<plural>` - Auto-derive singular (e.g., `guests` → `guest`)
- `<plural>:<singular>` - Specify both explicitly (e.g., `guests:guest`)

### 2. Bash Version (`copy-and-rename-module.sh`)

Fast shell script implementation with colorful output.

**Usage:**
```bash
# From the backend directory
./scripts/copy-and-rename-module.sh <source> <target> [base_path]

# Examples
./scripts/copy-and-rename-module.sh guests employees
./scripts/copy-and-rename-module.sh guests:guest employees:employee
./scripts/copy-and-rename-module.sh guests employees src/modules/identities
```

**Format Options:**
- `<plural>` - Auto-derive singular (e.g., `guests` → `guest`)
- `<plural>:<singular>` - Specify both explicitly (e.g., `guests:guest`)

## What These Scripts Do

1. **Copy Directory Structure**: Creates a complete copy of the source module directory
2. **Rename Files**: Automatically renames files to match the target module name
3. **Rename Directories**: Renames subdirectories that contain the source module name
4. **Replace Content**: Updates all references within files from source to target names

## Supported File Types

- TypeScript (`.ts`)
- JavaScript (`.js`) 
- JSON (`.json`)
- Markdown (`.md`)
- SQL (`.sql`)

## Name Case Conversions

The scripts automatically handle multiple naming conventions for both **plural and singular** forms:

**Plural Forms (Module Names):**
- **lowercase**: `guests` → `employees`
- **Capitalized**: `Guests` → `Employees`
- **UPPERCASE**: `GUESTS` → `EMPLOYEES`
- **PascalCase**: `GuestsModule` → `EmployeesModule`
- **snake_case**: `guests_service` → `employees_service`
- **kebab-case**: `guests-controller` → `employees-controller`

**Singular Forms (Entity Names):**
- **lowercase**: `guest` → `employee`
- **Capitalized**: `Guest` → `Employee`
- **UPPERCASE**: `GUEST` → `EMPLOYEE`
- **PascalCase**: `GuestEntity` → `EmployeeEntity`
- **snake_case**: `guest_entity` → `employee_entity`
- **kebab-case**: `guest-dto` → `employee-dto`

## Database Conventions

Special handling for common database naming patterns:

- **Table names (plural)**: `account_guests` → `account_employees`
- **Hyphenated (plural)**: `account-guests` → `account-employees`
- **Entity files (singular)**: `guest_entity` → `employee_entity`
- **Entity classes**: `GuestEntity` → `EmployeeEntity`

## Auto-Derivation Rules

When only plural form is provided, singular is derived using these rules:

- `*ies` → `*y` (companies → company)
- `*oes` → `*o` (heroes → hero)  
- `*ses/*ches/*shes` → remove `es` (boxes → box, watches → watch)
- `*s` (not `*ss`) → remove `s` (guests → guest)
- No change for irregular or already singular forms

## Input Format Examples

```bash
# Auto-derive singular from plural
guests → guests (plural), guest (singular)
companies → companies (plural), company (singular)

# Explicit singular and plural
guests:guest → guests (plural), guest (singular)
people:person → people (plural), person (singular)
children:child → children (plural), child (singular)
```

## After Running

The scripts will provide next steps including:

1. Review generated files for manual adjustments
2. Update module imports in main module files
3. Add new module to `app.module.ts`
4. Create/update database migrations
5. Update API routes and documentation
6. Test the new module functionality

## Example Output

```
ℹ️  Starting module copy and rename process...
ℹ️  Source: guests (guest)
ℹ️  Target: employees (employee)
ℹ️  Base Path: src/modules/identities
ℹ️  Copying module directory...
✅ Module copied successfully
ℹ️  Renaming files and directories...
✅ Renamed: guest.entity.ts → employee.entity.ts
✅ Renamed: create-guest.dto.ts → create-employee.dto.ts
ℹ️  Replacing content in files...
✅ Updated content: employee.entity.ts
✅ Updated content: employee.module.ts
✅ Module employees created successfully!
```

## Prerequisites

### For TypeScript version:
- Node.js with TypeScript support
- `ts-node` installed (`npm install -g ts-node`)

### For Bash version:
- Unix-like system (macOS, Linux, WSL)
- Standard Unix tools (`cp`, `find`, `sed`, etc.)

Both scripts are safe to run multiple times and will prevent overwriting existing modules.