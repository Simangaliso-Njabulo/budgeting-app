#!/usr/bin/env python3
"""
Update Settings.tsx to use CSS Modules
"""

import re

# Read the file
with open('src/components/Settings.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import after the last import statement
content = re.sub(
    r"(import { useTheme, CURRENCIES } from '../context/ThemeContext';)",
    r"\1\nimport styles from './Settings.module.css';",
    content
)

# Replace settings- prefixed classes with module styles
# Keep page-level classes as-is (page-content, page-header, etc.)
replacements = {
    'settings-section': 'section',
    'settings-card': 'card',
    'settings-row': 'row',
    'settings-row-info': 'rowInfo',
    'settings-row-label': 'rowLabel',
    'settings-row-description': 'rowDescription',
    'theme-toggle-group': 'themeToggleGroup',
    'theme-toggle-btn': 'themeToggleBtn',
    'theme-toggle-icon': 'themeToggleIcon',
    'theme-toggle-label': 'themeToggleLabel',
    'settings-select-wrapper': 'selectWrapper',
    'settings-select-icon': 'selectIcon',
    'settings-select': 'select',
    'settings-profile': 'profile',
    'settings-avatar': 'avatar',
    'settings-avatar-edit': 'avatarEdit',
    'settings-avatar-edit-icon': 'avatarEditIcon',
    'settings-profile-info': 'profileInfo',
    'settings-profile-name': 'profileName',
    'settings-profile-email': 'profileEmail',
    'settings-form-group': 'formGroup',
    'settings-form-label': 'formLabel',
    'settings-form-icon': 'formIcon',
    'settings-currency-input': 'currencyInput',
    'settings-notification-row': 'notificationRow',
    'settings-notification-info': 'notificationInfo',
    'settings-notification-label': 'notificationLabel',
    'settings-notification-desc': 'notificationDesc',
    'settings-toggle': 'toggle',
    'settings-security-item': 'securityItem',
    'settings-security-left': 'securityLeft',
    'settings-security-icon': 'securityIcon',
    'settings-security-info': 'securityInfo',
    'settings-security-label': 'securityLabel',
    'settings-security-desc': 'securityDesc',
    'settings-security-btn': 'securityBtn',
    'settings-data-actions': 'dataActions',
    'settings-action-btn': 'actionBtn',
    'settings-action-btn-danger': 'actionBtnDanger',
    'settings-btn-icon': 'btnIcon',
    'settings-about': 'about',
    'settings-version': 'version',
    'settings-links': 'links',
    'settings-link': 'link',
    'settings-section-title': 'sectionTitle',
}

# Replace className="settings-xxx" with className={styles.xxx}
for old_class, new_class in replacements.items():
    # Simple className with just this class
    content = re.sub(
        rf'className="{old_class}"',
        f'className={{styles.{new_class}}}',
        content
    )

    # className with template literals (e.g., className={`theme-toggle-btn ${...}`})
    content = re.sub(
        rf'className={{`{old_class}',
        f'className={{`${{styles.{new_class}}}',
        content
    )

    # className with multiple classes (e.g., "settings-action-btn settings-action-btn-danger")
    content = re.sub(
        rf'{old_class}(?=\s)',
        f'${{styles.{new_class}}}',
        content
    )

# Write the updated content
with open('src/components/Settings.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Settings.tsx updated successfully!")
