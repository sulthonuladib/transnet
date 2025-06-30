// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default tseslint.config(
  {
    // Global ignores
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'src/public/**',
      'storage/**',
      '**/*.min.js',
      'drizzle.config.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Custom rules for crypto trading project
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_|^(secret|passphrase)$', // Allow common crypto params
          varsIgnorePattern:
            '^_|^(createId|primaryKey|userInsertSchema|walletSchema|exchangeConfigSchema|allCoins|allBalances|validationResult)$',
          caughtErrorsIgnorePattern: '^_|^(error|e)$', // Allow standard error names
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // Allow explicit any for external API responses (crypto exchanges)
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off', // Allow require for crypto libraries
      'prefer-const': 'error',
    },
  },
  {
    // Disable type-aware linting on JS files
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  // Prettier integration - must be last to override conflicting rules
  eslintConfigPrettier
);
