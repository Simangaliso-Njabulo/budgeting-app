#!/usr/bin/env python3
"""
Extract complete CSS blocks for Settings
"""

import re

# Read the backup file
with open('src/styles/globals.css.backup', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all CSS blocks that start with .settings- or .theme-toggle-
# This regex matches a class selector and its complete block (including nested braces)
pattern = r'(\.(settings-|theme-toggle-)[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)?(?:::[a-zA-Z0-9_-]+)?(?::[a-zA-Z0-9_-]+)?(?:\s*,\s*\.[a-zA-Z0-9_:-]+)*)\s*\{[^}]*\}'

matches = re.findall(pattern, content, re.MULTILINE)

# Now extract the full blocks
blocks = []
for match in matches:
    selector = match[0]
    # Find the full block including the content
    idx = content.find(selector)
    if idx != -1:
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
                # Transform class names
                block = re.sub(r'\.settings-', '.', block)
                block = re.sub(r'\.theme-toggle-', '.theme', block)
                blocks.append(block)

# Remove duplicates
blocks = list(dict.fromkeys(blocks))

# Write to file
with open('src/components/Settings.module.css', 'w', encoding='utf-8') as f:
    for block in blocks:
        f.write(block + '\n\n')

print(f"Extracted {len(blocks)} CSS blocks for Settings")
