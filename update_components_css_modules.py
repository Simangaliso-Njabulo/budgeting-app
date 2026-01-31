# -*- coding: utf-8 -*-
"""Update components to import and use CSS Modules"""
import re

components_to_update = [
    ('src/components/BucketTable.tsx', 'BucketTable', ['budget-summary']),
    ('src/components/categories/CategoryForm.tsx', 'CategoryForm', ['category-form', 'color-picker']),
    ('src/components/auth/Login.tsx', 'Login', ['auth-']),
    ('src/components/dashboard/SpendingTrend.tsx', 'SpendingTrend', ['spending-trend']),
    ('src/components/transactions/TransactionList.tsx', 'TransactionList', ['transaction-list', 'transaction-item']),
]

for file_path, comp_name, prefixes in components_to_update:
    print(f"Updating {comp_name}...")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Skip if already has the import
        if f"from './{comp_name}.module.css'" in content or f'from "./{comp_name}.module.css"' in content:
            print(f"  Skipping (already has CSS Module import)")
            continue

        # Add import after last import
        import_line = f"import styles from './{comp_name}.module.css';"
        # Find the last import statement
        last_import_match = list(re.finditer(r'^import .*?;$', content, re.MULTILINE))
        if last_import_match:
            last_import_pos = last_import_match[-1].end()
            content = content[:last_import_pos] + '\n' + import_line + content[last_import_pos:]

        # Replace class names for each prefix
        for prefix in prefixes:
            # Simple className="prefix-something"
            content = re.sub(
                rf'className="({prefix}[a-zA-Z0-9_-]*)"',
                lambda m: f'className={{styles.{m.group(1).replace(prefix, "").replace("-", "")}}}',
                content
            )

            # Template literal className={`prefix-something ...`}
            content = re.sub(
                rf'className={{`({prefix}[a-zA-Z0-9_-]*)',
                lambda m: f'className={{`${{styles.{m.group(1).replace(prefix, "").replace("-", "")}}}',
                content
            )

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  Updated successfully")
    except Exception as e:
        print(f"  Error: {e}")

print("\nDone! Build the app to see if there are any issues.")
