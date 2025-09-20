# 🚨 CRITICAL RULE — ALWAYS FOLLOW THIS 🚨

Before editing any file, you must read at least 3 existing files. This ensures you understand the conventions and maintain consistency.

👉 **This rule is NON-NEGOTIABLE. Never skip this step.**

## Why this matters:
* Keep code consistent with project patterns
* Gain proper understanding of conventions
* Follow the established architecture
* Avoid breaking changes
* Use similar files as concrete examples

## Steps to follow:
1. **Read at least 3 relevant existing files**
2. **Understand the patterns and conventions used**
3. **Only then proceed with creating or editing files**

---

## 🚨 CRITICAL DEBUGGING & PERFORMANCE RULES 🚨

### Performance Optimization

1. **Data Size Limits**: 
   - Clear large data automatically if detected

2. **Avoid UI Freezes**:
   - Check console for "Hang detected" warnings
   - If data loading takes >1 second, use async loading
   - Limit array operations to reasonable sizes (<1000 items)
   - Use FlatList/VirtualizedList for long lists in React Native

### Navigation & View Hierarchy

1. **When Creating New Screens**:
   - ALWAYS check if a similar view already exists
   - If replacing a view, rename the old one first 
   - Update ALL references in the codebase (use grep/search)
   - Common places to check: app/_layout.tsx, (tabs)/_layout.tsx, navigation destinations

2. **Screen Naming Conventions**:
   - Main screens accessed from tab bar: `NameScreen` (e.g., `HomeScreen`, `MenuScreen`)
   - Detail/sub-screens: `DescriptiveNameScreen` (e.g., `ProductDetailScreen`)
   - Modal screens: `NameModal` or `NameSheet` (e.g., `CartModal`, `OrderSheet`)

---

## 📱 BriveFood Project Specific Rules

### File Structure Conventions
- **Screens**: `app/(tabs)/` for main tab screens, `app/` for modals
- **Components**: `src/components/` organized by feature (common, customer, restaurant)
- **Constants**: `src/constants/theme.js` for design system
- **Types**: `src/types/index.js` for TypeScript-like constants
- **Context**: `src/context/` for React Context providers

### Styling Conventions
- Use theme constants from `src/constants/theme.js`
- Colors: `colors.primary.main`, `colors.accent.main`, etc.
- Spacing: `spacing.md`, `spacing.lg`, etc.
- Typography: `typography.fontSizes.lg`, `typography.fontWeights.bold`

### Component Patterns
- Use `LinearGradient` for main action buttons
- Use `Ionicons` for all icons
- Use `TouchableOpacity` for interactive elements
- Export default function at the end of files

### Navigation Patterns
- Use `router.push()` for navigation (Expo Router)
- Use `router.back()` to go back
- Modal presentation for cart, auth, etc.

### Animation Guidelines
- **DO NOT** use Framer Motion (causes errors in React Native)
- Use native React Native animations or react-native-reanimated
- Keep animations simple and performant

---

## 🔧 Development Workflow

### Before Making Changes:
1. **Read existing similar files** (minimum 3)
2. **Check current conventions** in the codebase
3. **Test with `npm start`** after changes
4. **Verify no console errors** or warnings

### Testing Commands:
```bash
# Test file structure
node test-imports.js

# Start development server
npm start

# Or on specific port if needed
npx expo start --port 8085 --clear
```

### Common Issues to Avoid:
- Don't use `@/` imports (use relative paths like `../../src/`)
- Don't use Framer Motion (use React Native Views)
- Don't add scanner/barcode dependencies
- Don't create auth routes without implementing the screens

---

## 🎯 Code Quality Standards

### Always Follow:
- **Consistent imports** order
- **Theme usage** for all styling
- **Component reusability** patterns
- **Error handling** for async operations
- **Loading states** for data fetching

### File Headers:
```javascript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
```

This ensures consistency across all BriveFood application files.