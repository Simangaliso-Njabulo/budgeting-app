#!/usr/bin/env python3
"""
Migrate all remaining components to CSS Modules in bulk
"""

import re
import os

# Read the backup file
with open('src/styles/globals.css.backup', 'r', encoding='utf-8') as f:
    content = f.read()

# Define components and their CSS class prefixes
components = {
    'BucketTable': ['budget-summary', 'bucket-'],
    'SpendingTrend': ['spending-trend'],
    'MonthlyTrendChart': ['monthly-trend'],
    'TransactionList': ['transaction-list', 'transaction-item', 'transaction-group', 'transaction-date-header'],
    'TransactionForm': ['form-', 'input-', 'textarea-', 'select-', 'checkbox-', 'radio-', 'button-'],
    'TransactionFilters': ['filter-', 'search-'],
    'TransactionSummary': ['transaction-summary'],
    'CategoryForm': ['category-form', 'color-picker', 'icon-picker'],
    'Login': ['auth-', 'login-'],
    'SignUp': ['auth-', 'signup-'],
    'ForgotPassword': ['auth-', 'forgot-'],
    'BucketForm': ['bucket-form'],
    'Header': ['header-'],
    'Navigation': ['nav-', 'navigation-'],
    'TransactionTable': ['data-table', 'table-'],
    'CategoryCard': ['category-card'],
    'ActionButton': ['action-btn'],
}

def extract_css_blocks(content, prefixes):
    """Extract all CSS blocks matching the given prefixes"""
    blocks = []
    for prefix in prefixes:
        # Find all CSS blocks that start with .prefix
        pattern = rf'(\.' + prefix.replace('-', r'\-') + r'[a-zA-Z0-9_-]*(?:\.[a-zA-Z0-9_-]+)?(?:::[a-zA-Z0-9_-]+)?(?::[a-zA-Z0-9_-]+)?(?:\s*,\s*\.[a-zA-Z0-9_:-]+)*)\s*\{'

        for match in re.finditer(pattern, content):
            selector = match.group(1)
            idx = match.start()

            # Find the matching closing brace
            start = content.find('{', idx)
            if start != -1:
                brace_count = 1
                i = start + 1
                while i < len(content) and brace_count > 0:
                    if content[i] == '{':
                        brace_count += 1
                    elif content[i] == '}':
                        brace_count -= 1
                    i += 1

                if brace_count == 0:
                    block = content[idx:i]
                    blocks.append(block)

    return list(dict.fromkeys(blocks))  # Remove duplicates

def transform_class_names(blocks, component_name):
    """Transform class names by removing component prefix"""
    transformed = []
    for block in blocks:
        # Remove common prefixes
        for prefix in components[component_name]:
            # Convert .prefix-name to .name
            pattern = r'\.' + prefix.replace('-', r'\-') + r'([a-zA-Z0-9_-]*)'
            block = re.sub(pattern, lambda m: '.' + m.group(1) if m.group(1) else '.container', block)
        transformed.append(block)
    return transformed

# Process each component
for component_name, prefixes in components.items():
    print(f"Processing {component_name}...")

    # Extract CSS blocks
    blocks = extract_css_blocks(content, prefixes)

    if blocks:
        # Transform class names
        transformed_blocks = transform_class_names(blocks, component_name)

        # Determine output path
        if component_name in ['Login', 'SignUp', 'ForgotPassword']:
            output_path = f'src/components/auth/{component_name}.module.css'
        elif component_name in ['TransactionList', 'TransactionForm', 'TransactionFilters', 'TransactionSummary']:
            output_path = f'src/components/transactions/{component_name}.module.css'
        elif component_name in ['CategoryForm', 'CategoryCard']:
            output_path = f'src/components/categories/{component_name}.module.css'
        elif component_name == 'TransactionTable':
            output_path = f'src/components/{component_name}.module.css'
        else:
            output_path = f'src/components/{component_name}.module.css'

        # Check if file already exists
        if os.path.exists(output_path):
            print(f"  ✓ {component_name}.module.css already exists, skipping")
            continue

        # Write CSS Module
        with open(output_path, 'w', encoding='utf-8') as f:
            for block in transformed_blocks:
                f.write(block + '\n\n')

        print(f"  ✓ Created {output_path} with {len(transformed_blocks)} blocks")
    else:
        print(f"  ✗ No CSS blocks found for {component_name}")

print("\n" + "="*60)
print("Migration complete!")
print("Next step: Update each component's .tsx file to import and use the CSS Module")
