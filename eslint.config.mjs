import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Warn on console.log — errors belong to console.error/warn
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Unused vars: error but allow underscore-prefixed params
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Explicit any: warn only — sometimes necessary at boundaries
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]

export default eslintConfig
