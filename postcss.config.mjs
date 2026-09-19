export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-preset-env': {
      features: {
        'oklab-function': true,
        'cascade-layers': true,
        'nesting-rules': true,
        'color-mix': true,
        'logical-properties-and-values': true,
        'is-pseudo-class': true,
      },
    },
  },
};
