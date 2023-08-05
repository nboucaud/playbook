// cSpell:ignore Tolgee
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { format } from 'prettier';

import { getAllProjectLanguages, getRemoteTranslations } from './api.js';
import { flattenTranslation, type TranslationRes } from './utils.js';

const INDENT = 2;
const RES_DIR = path.resolve(process.cwd(), 'src', 'resources');

const countKeys = (obj: TranslationRes | null) => {
  if (!obj) {
    return 0;
  }
  let count = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Object.entries(obj).forEach(([_, value]) => {
    if (typeof value === 'string') {
      count++;
    } else {
      count += countKeys(value);
    }
  });
  return count;
};

const getBaseTranslations = async (baseLanguage: { tag: string }) => {
  try {
    const baseTranslationsStr = await fs.readFile(
      path.resolve(RES_DIR, `${baseLanguage.tag}.json`),
      { encoding: 'utf8' }
    );
    const baseTranslations = JSON.parse(baseTranslationsStr);
    return baseTranslations;
  } catch (e) {
    console.error('base language:', JSON.stringify(baseLanguage));
    console.error('Failed to read base language', e);
    const translations = await getRemoteTranslations(baseLanguage.tag);
    await fs.writeFile(
      path.resolve(RES_DIR, `${baseLanguage.tag}.json`),
      JSON.stringify(translations, null, 4)
    );
  }
};

const main = async () => {
  try {
    await fs.access(RES_DIR);
  } catch (error) {
    fs.mkdir(RES_DIR).catch(console.error);
    console.log('Create directory', RES_DIR);
  }
  console.log('Loading project languages...');
  const languages = await getAllProjectLanguages();
  const baseLanguage = languages.find(language => language.base);
  if (!baseLanguage) {
    console.error(JSON.stringify(languages));
    throw new Error('Could not find base language');
  }
  console.log(`Loading ${baseLanguage.tag} languages translations as base...`);

  const baseTranslations = await getBaseTranslations(baseLanguage);
  const baseKeyNum = countKeys(baseTranslations);
  const languagesWithTranslations = await Promise.all(
    languages.map(async language => {
      console.log(`Loading ${language.tag} translations...`);
      const translations = await getRemoteTranslations(language.tag);
      const keyNum = countKeys(translations);
      const completeRate = Number((keyNum / baseKeyNum).toFixed(3));
      console.log(
        `Load ${language.name} ${
          completeRate * 100
        }, %(${keyNum}/${baseKeyNum}) complete`
      );

      return {
        ...language,
        translations,
        completeRate,
      };
    })
  );

  const availableLanguages = languagesWithTranslations.filter(
    language => language.completeRate > 0.4
  );

  for (const language of availableLanguages
    // skip base language
    .filter(i => !i.base)) {
    await fs.writeFile(
      path.resolve(RES_DIR, `${language.tag}.json`),
      JSON.stringify(
        {
          '// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.':
            '',
          ...flattenTranslation(language.translations),
        },
        null,
        INDENT
      ) + '\n'
    );
  }

  console.log('Generating meta data...');
  const code = `// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
        // Run \`yarn run download-resources\` to regenerate.
        // If you need to update the code, please edit \`i18n/src/scripts/download.ts\` inside your project.
        ${availableLanguages
          .map(
            language =>
              `import ${language.tag.replaceAll('-', '_')} from './${
                language.tag
              }.json'`
          )
          .sort()
          .join('\n')}

        export const LOCALES = [
            ${availableLanguages
              // eslint-disable-next-line @typescript-eslint/no-unused-vars -- omit key
              .map(({ translations, ...language }) =>
                JSON.stringify({
                  ...language,
                  // a trick to generate a string without quotation marks
                  res: '__RES_PLACEHOLDER',
                }).replace(
                  '"__RES_PLACEHOLDER"',
                  language.tag.replaceAll('-', '_')
                )
              )
              .join(',\n')}
        ] as const;
        `;

  await fs.writeFile(
    path.resolve(RES_DIR, 'index.ts'),
    await format(code, {
      parser: 'typescript',
      singleQuote: true,
      trailingComma: 'es5',
      tabWidth: INDENT,
      arrowParens: 'avoid',
    })
  );
  console.log('Done');
};

main().catch(e => {
  console.error(e);
  process.exit(1);
});
