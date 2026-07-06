import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
  // Modules that intentionally export non-components (shadcn primitives export
  // variants; the router file exports the router object). Fast-refresh's
  // component-only constraint doesn't apply to them.
  {
    files: [
      'src/components/ui/**/*.{ts,tsx}',
      'src/app/router/router.tsx',
      'src/**/*Context.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // Disable stylistic rules that conflict with Prettier. Must be last.
  prettier,
])
