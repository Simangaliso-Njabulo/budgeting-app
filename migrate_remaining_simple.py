# -*- coding: utf-8 -*-
import re
import os

with open('src/styles/globals.css.backup', 'r', encoding='utf-8') as f:
    content = f.read()

components = {
    'BucketTable': ['budget-summary'],
    'SpendingTrend': ['spending-trend'],
    'TransactionList': ['transaction-list', 'transaction-item'],
    'CategoryForm': ['category-form'],
    'Login': ['auth-'],
}

for comp_name, prefixes in components.items():
    print(f"Processing {comp_name}...")
    blocks = []

    for prefix in prefixes:
        pattern = rf'(\.' + prefix.replace('-', r'\-') + r'[a-zA-Z0-9_-]*)\s*\{[^}}]*\}'
        matches = re.findall(pattern, content)
        for selector in matches:
            idx = content.find(selector + ' {')
            if idx != -1:
                start = content.find('{', idx)
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
                    for p in prefixes:
                        block = re.sub(r'\.' + p.replace('-', r'\-'), '.', block)
                    blocks.append(block)

    if blocks:
        output_path = f'src/components/{comp_name}.module.css'
        if os.path.exists(output_path):
            print(f"  Skipping (exists)")
            continue
        with open(output_path, 'w', encoding='utf-8') as f:
            for block in set(blocks):
                f.write(block + '\n\n')
        print(f"  Created with {len(set(blocks))} blocks")
    else:
        print(f"  No blocks found")
