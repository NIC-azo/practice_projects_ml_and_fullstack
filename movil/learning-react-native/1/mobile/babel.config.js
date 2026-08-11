export default function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // 💡 Añadimos los plugins para resolver el alias @/
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
          },
        },
      ],
      ['nativewind/babel']
    ],
  };
};
