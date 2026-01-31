#!/usr/bin/env python3
"""
Script to extract remaining component styles from globals.css.backup
and help create CSS Module files
"""

import re
import os

# Read the backup file
with open('src/styles/globals.css.backup', 'r', encoding='utf-8') as f:
    content = f.read()

# Components that need migration with their class prefixes
components_to_migrate = {
    'Settings': {
        'search_terms': ['SETTINGS PAGE', 'ENHANCED SETTINGS PAGE', 'settings-'],
        'start_line': 1556,
        'end_line': 4849,
    },
    'BucketTable': {
        'search_terms': ['BUDGET SUMMARY', 'budget-summary', 'bucket-'],
        'start_line': 248,
        'end_line': 310,
    },
    'SpendingTrend': {
        'search_terms': ['spending-trend'],
        'start_line': 3700,
        'end_line': 3850,
    },
    'MonthlyTrendChart': {
        'search_terms': ['monthly-trend'],
        'start_line': 3850,
        'end_line': 3950,
    },
    'TransactionList': {
        'search_terms': ['TRANSACTION COMPONENTS', 'transaction-item', 'transaction-list'],
        'start_line': 2991,
        'end_line': 3575,
    },
    'TransactionForm': {
        'search_terms': ['FORM STYLES', 'form-group', 'form-input'],
        'start_line': 1425,
        'end_line': 1512,
    },
    'TransactionFilters': {
        'search_terms': ['filter-'],
        'start_line': 867,
        'end_line': 1276,
    },
    'TransactionSummary': {
        'search_terms': ['transaction-summary'],
        'start_line': 2991,
        'end_line': 3100,
    },
    'CategoryForm': {
        'search_terms': ['category-form', 'color-picker'],
        'start_line': 2621,
        'end_line': 2990,
    },
    'Login': {
        'search_terms': ['AUTHENTICATION PAGES', 'auth-'],
        'start_line': 4603,
        'end_line': 4849,
    },
}

# Extract lines for each component
lines = content.split('\n')

print("Component Style Extraction Report")
print("=" * 60)

for comp_name, info in components_to_migrate.items():
    print(f"\n{comp_name}:")
    print(f"  Suggested lines: {info['start_line']}-{info['end_line']}")

    # Extract the relevant section
    section = '\n'.join(lines[info['start_line']-1:info['end_line']])

    # Find classes matching the search terms
    classes_found = set()
    for term in info['search_terms']:
        # Find class names containing the term
        pattern = rf'\.({term}[a-zA-Z0-9_-]*)\s*{{'
        matches = re.findall(pattern, section)
        classes_found.update(matches)

    if classes_found:
        print(f"  Classes found: {len(classes_found)}")
        print(f"  Sample classes: {list(classes_found)[:5]}")
    else:
        print(f"  No classes found with search terms: {info['search_terms']}")

print("\n" + "=" * 60)
print("To extract a component's styles:")
print("sed -n 'START,ENDp' src/styles/globals.css.backup > temp.css")
