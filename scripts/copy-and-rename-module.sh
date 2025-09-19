#!/bin/bash

# Script to copy and rename a NestJS module with automatic content replacement
# Usage: ./copy-and-rename-module.sh <source> <target> [base_path]
# Example: ./copy-and-rename-module.sh guests employees
# Example: ./copy-and-rename-module.sh guests:guest employees:employee

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check arguments
if [ $# -lt 2 ]; then
    log_error "Usage: $0 <source> <target> [base_path]"
    log_error "Examples:"
    log_error "  $0 guests employees"
    log_error "  $0 guests:guest employees:employee"
    log_error "  $0 guests employees src/modules/identities"
    log_info ""
    log_info "Format: <plural>:<singular> or just <plural>"
    log_info "If only plural provided, singular will be auto-derived"
    exit 1
fi

SOURCE_MODULE="$1"
TARGET_MODULE="$2"
BASE_PATH="${3:-src/modules/identities}"

# Parse source module (plural:singular or just plural)
if [[ "$SOURCE_MODULE" == *":"* ]]; then
    SOURCE_PLURAL=$(echo "$SOURCE_MODULE" | cut -d: -f1)
    SOURCE_SINGULAR=$(echo "$SOURCE_MODULE" | cut -d: -f2)
else
    SOURCE_PLURAL="$SOURCE_MODULE"
    # Simple singular derivation
    if [[ "$SOURCE_PLURAL" == *"ies" ]]; then
        SOURCE_SINGULAR="${SOURCE_PLURAL%ies}y"
    elif [[ "$SOURCE_PLURAL" == *"oes" ]]; then
        SOURCE_SINGULAR="${SOURCE_PLURAL%es}"
    elif [[ "$SOURCE_PLURAL" == *"ses" ]] || [[ "$SOURCE_PLURAL" == *"ches" ]] || [[ "$SOURCE_PLURAL" == *"shes" ]]; then
        SOURCE_SINGULAR="${SOURCE_PLURAL%es}"
    elif [[ "$SOURCE_PLURAL" == *"s" ]] && [[ "$SOURCE_PLURAL" != *"ss" ]]; then
        SOURCE_SINGULAR="${SOURCE_PLURAL%s}"
    else
        SOURCE_SINGULAR="$SOURCE_PLURAL"
    fi
fi

# Parse target module (plural:singular or just plural)
if [[ "$TARGET_MODULE" == *":"* ]]; then
    TARGET_PLURAL=$(echo "$TARGET_MODULE" | cut -d: -f1)
    TARGET_SINGULAR=$(echo "$TARGET_MODULE" | cut -d: -f2)
else
    TARGET_PLURAL="$TARGET_MODULE"
    # Simple singular derivation
    if [[ "$TARGET_PLURAL" == *"ies" ]]; then
        TARGET_SINGULAR="${TARGET_PLURAL%ies}y"
    elif [[ "$TARGET_PLURAL" == *"oes" ]]; then
        TARGET_SINGULAR="${TARGET_PLURAL%es}"
    elif [[ "$TARGET_PLURAL" == *"ses" ]] || [[ "$TARGET_PLURAL" == *"ches" ]] || [[ "$TARGET_PLURAL" == *"shes" ]]; then
        TARGET_SINGULAR="${TARGET_PLURAL%es}"
    elif [[ "$TARGET_PLURAL" == *"s" ]] && [[ "$TARGET_PLURAL" != *"ss" ]]; then
        TARGET_SINGULAR="${TARGET_PLURAL%s}"
    else
        TARGET_SINGULAR="$TARGET_PLURAL"
    fi
fi

SOURCE_PATH="$BASE_PATH/$SOURCE_PLURAL"
TARGET_PATH="$BASE_PATH/$TARGET_PLURAL"

# Function to capitalize first letter
capitalize() {
    echo "$1" | sed 's/./\U&/'
}

# Function to convert to PascalCase
to_pascal_case() {
    echo "$1" | sed 's/[-_]\([a-z]\)/\U\1/g' | sed 's/^\([a-z]\)/\U\1/'
}

# Function to convert to snake_case
to_snake_case() {
    echo "$1" | sed 's/\([A-Z]\)/_\L\1/g' | sed 's/^_//'
}

# Function to convert to kebab-case
to_kebab_case() {
    echo "$1" | sed 's/\([A-Z]\)/-\L\1/g' | sed 's/^-//'
}

log_info "Starting module copy and rename process..."
log_info "Source: $SOURCE_PLURAL ($SOURCE_SINGULAR)"
log_info "Target: $TARGET_PLURAL ($TARGET_SINGULAR)"
log_info "Base Path: $BASE_PATH"

# Check if source exists
if [ ! -d "$SOURCE_PATH" ]; then
    log_error "Source module not found: $SOURCE_PATH"
    exit 1
fi

# Check if target already exists
if [ -d "$TARGET_PATH" ]; then
    log_error "Target module already exists: $TARGET_PATH"
    exit 1
fi

# Copy the module
log_info "Copying module directory..."
cp -r "$SOURCE_PATH" "$TARGET_PATH"
log_success "Module copied successfully"

# Generate replacement pairs
declare -A REPLACEMENTS

# Plural forms
REPLACEMENTS["$SOURCE_PLURAL"]="$TARGET_PLURAL"
REPLACEMENTS["$(capitalize $SOURCE_PLURAL)"]="$(capitalize $TARGET_PLURAL)"
REPLACEMENTS["$(echo $SOURCE_PLURAL | tr '[:lower:]' '[:upper:]')"]="$(echo $TARGET_PLURAL | tr '[:lower:]' '[:upper:]')"
REPLACEMENTS["$(to_pascal_case $SOURCE_PLURAL)"]="$(to_pascal_case $TARGET_PLURAL)"
REPLACEMENTS["$(to_snake_case $SOURCE_PLURAL)"]="$(to_snake_case $TARGET_PLURAL)"
REPLACEMENTS["$(to_kebab_case $SOURCE_PLURAL)"]="$(to_kebab_case $TARGET_PLURAL)"

# Singular forms
REPLACEMENTS["$SOURCE_SINGULAR"]="$TARGET_SINGULAR"
REPLACEMENTS["$(capitalize $SOURCE_SINGULAR)"]="$(capitalize $TARGET_SINGULAR)"
REPLACEMENTS["$(echo $SOURCE_SINGULAR | tr '[:lower:]' '[:upper:]')"]="$(echo $TARGET_SINGULAR | tr '[:lower:]' '[:upper:]')"
REPLACEMENTS["$(to_pascal_case $SOURCE_SINGULAR)"]="$(to_pascal_case $TARGET_SINGULAR)"
REPLACEMENTS["$(to_snake_case $SOURCE_SINGULAR)"]="$(to_snake_case $TARGET_SINGULAR)"
REPLACEMENTS["$(to_kebab_case $SOURCE_SINGULAR)"]="$(to_kebab_case $TARGET_SINGULAR)"

# Database table names (usually plural)
REPLACEMENTS["account_${SOURCE_PLURAL}"]="account_${TARGET_PLURAL}"
REPLACEMENTS["account-${SOURCE_PLURAL}"]="account-${TARGET_PLURAL}"

# Special TypeORM entity naming (usually singular)
REPLACEMENTS["${SOURCE_SINGULAR}_entity"]="${TARGET_SINGULAR}_entity"
REPLACEMENTS["${SOURCE_SINGULAR}-entity"]="${TARGET_SINGULAR}-entity"

# Common combinations
REPLACEMENTS["${SOURCE_PLURAL}Service"]="${TARGET_PLURAL}Service"
REPLACEMENTS["${SOURCE_PLURAL}Controller"]="${TARGET_PLURAL}Controller"
REPLACEMENTS["${SOURCE_PLURAL}Module"]="${TARGET_PLURAL}Module"
REPLACEMENTS["$(capitalize $SOURCE_SINGULAR)Entity"]="$(capitalize $TARGET_SINGULAR)Entity"

# Function to rename files
rename_files() {
    local dir="$1"
    
    find "$dir" -type f | while read -r file; do
        local dirname=$(dirname "$file")
        local basename=$(basename "$file")
        local newname="$basename"
        
        # Apply replacements to filename
        for old in "${!REPLACEMENTS[@]}"; do
            new="${REPLACEMENTS[$old]}"
            newname=$(echo "$newname" | sed "s/$old/$new/g")
        done
        
        if [ "$newname" != "$basename" ]; then
            local newpath="$dirname/$newname"
            mv "$file" "$newpath"
            log_success "Renamed: $basename → $newname"
        fi
    done
    
    # Rename directories
    find "$dir" -type d | sort -r | while read -r directory; do
        local dirname=$(dirname "$directory")
        local basename=$(basename "$directory")
        local newname="$basename"
        
        # Apply replacements to directory name
        for old in "${!REPLACEMENTS[@]}"; do
            new="${REPLACEMENTS[$old]}"
            newname=$(echo "$newname" | sed "s/$old/$new/g")
        done
        
        if [ "$newname" != "$basename" ] && [ "$directory" != "$dir" ]; then
            local newpath="$dirname/$newname"
            mv "$directory" "$newpath"
            log_success "Renamed directory: $basename → $newname"
        fi
    done
}

# Function to replace content in files
replace_content() {
    local dir="$1"
    
    find "$dir" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.sql" \) | while read -r file; do
        local changed=false
        
        for old in "${!REPLACEMENTS[@]}"; do
            new="${REPLACEMENTS[$old]}"
            if grep -q "$old" "$file" 2>/dev/null; then
                sed -i.bak "s/$old/$new/g" "$file"
                changed=true
            fi
        done
        
        if [ "$changed" = true ]; then
            rm -f "${file}.bak"
            log_success "Updated content: $(basename $file)"
        fi
    done
}

# Rename files and directories
log_info "Renaming files and directories..."
rename_files "$TARGET_PATH"

# Replace content in files
log_info "Replacing content in files..."
replace_content "$TARGET_PATH"

log_success "Module $TARGET_PLURAL created successfully!"

# Print next steps
echo ""
log_info "📋 Next Steps:"
echo "1. Review the generated files and make manual adjustments if needed"
echo "2. Update module imports in the main module files"
echo "3. Add the new module to your app.module.ts"
echo "4. Create/update database migrations if needed"
echo "5. Update API routes and documentation"
echo "6. Test the new $TARGET_PLURAL module functionality"

echo ""
log_info "🔍 Files to review:"
echo "- $TARGET_PATH/entities/"
echo "- $TARGET_PATH/dto/"
echo "- $TARGET_PATH/*.module.ts"

echo ""
log_info "🚀 Ready to use your new $TARGET_PLURAL module!"