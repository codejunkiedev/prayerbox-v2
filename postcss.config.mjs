export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-preset-env': {
      features: {
        'oklab-function': true,
        'cascade-layers': true,
        'nesting-rules': true,
        'color-mix': true,
      },
      browsers: 'chrome >= 83',
    },
  },
};
