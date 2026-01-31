#!/usr/bin/env python3
"""
Properly extract Settings CSS from backup
"""

import re

# Read the backup file
with open('src/styles/globals.css.backup', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Extract the Settings sections (lines 1557-1842 and 4536-4849)
section1 = lines[1556:1842]  # SETTINGS PAGE
section2 = lines[4535:4849]  # ENHANCED SETTINGS PAGE

# Combine sections
all_lines = section1 + section2

# Remove section headers and empty lines at start
output_lines = []
skip_next = False
for line in all_lines:
    # Skip section headers
    if '/* =====' in line or line.strip().startswith('SETTINGS') or line.strip().startswith('ENHANCED'):
        skip_next = True
        continue
    if skip_next and '=====' in line:
        skip_next = False
        continue

    # Remove settings- prefix from class names
    line = re.sub(r'\.settings-', '.', line)
    # Remove theme-toggle- prefix
    line = re.sub(r'\.theme-toggle-', '.theme', line)

    output_lines.append(line)

# Write to Settings.module.css
with open('src/components/Settings.module.css', 'w', encoding='utf-8') as f:
    f.writelines(output_lines)

print(f"Settings.module.css created with {len(output_lines)} lines")
