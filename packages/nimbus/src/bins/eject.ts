/* eslint-disable no-restricted-syntax, no-await-in-loop */

import fs from 'fs';
import chalk from 'chalk';
import execa from 'execa';
import editJsonFile from 'edit-json-file';
import { prompt } from 'enquirer';
import { Path } from '@beemo/core';
import { NimbusPackage } from '@airbnb/nimbus-common';
import { BANNER } from '../constants';
import installDeps from '../helpers/installDeps';
import removeDeps from '../helpers/removeDeps';

interface EjectPrompt {
  monorepo: boolean;
  yarn: boolean;
}

const pkgPath = Path.resolve('package.json').path();

function writeJsFile(configPath: string, config: unknown) {
  fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(config, null, 2)}`, 'utf8');
}

async function copyAndInstallDepsFromModule(
  moduleName: string,
  isYarn: boolean,
  isMonorepo: boolean,
) {
  const pkg: NimbusPackage = require(`${moduleName}/package.json`);
  const deps = Object.keys(pkg.dependencies || {}).filter(
    (dep) => !dep.includes('@beemo') && !dep.includes('@airbnb/nimbus'),
  );

  await installDeps(deps, isYarn, isMonorepo);
  await removeDeps([moduleName], isYarn, isMonorepo);
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function migrateDotfiles() {
  const toRemove = [
    '# Configs',
    '# Configs (provided by Nimbus)',
    '.babelrc',
    '.eslintignore',
    '.eslintrc.js',
    '.flowconfig',
    '.prettierignore',
    'babel.config.js',
    'jest.config.js',
    'prettier.config.js',
    'tsconfig.json',
    'tsconfig.eslint.json',
    'tsconfig.options.json',
    '*.tsbuildinfo',
  ];

  try {
    const dotPath = Path.resolve('.gitignore').path();
    let data = fs.readFileSync(dotPath, 'utf8');

    toRemove.forEach((value) => {
      data = data.replace(new RegExp(`${escapeRegExp(value)}\n?`, 'g'), '');
    });

    fs.writeFileSync(dotPath, data.trim(), 'utf8');
  } catch (error) {
    // Ignore
  }
}

function migratePackageScripts(nimbus: NimbusPackage['nimbus']) {
  const pkg = editJsonFile(pkgPath);
  const scripts = pkg.get<NimbusPackage['scripts']>('scripts') ?? {};
  const srcFolder = nimbus.settings.srcFolder || 'src';
  const testFolder = nimbus.settings.testFolder || 'test';

  if (scripts.prepare?.includes('create-config')) {
    delete scripts.prepare;
  }

  if (scripts.release?.includes('auto-release')) {
    delete scripts.release;
  }

  Object.keys(scripts).forEach((key) => {
    const value = scripts[key];
    const esm = value.includes('--esm');

    scripts[key] = value
      .replace(
        'nimbus babel',
        `${esm ? 'ESM=true ' : ''}babel ./${srcFolder} --out-dir ./${esm ? 'esm' : 'lib'}`,
      )
      .replace('--esm', '')
      .replace(
        'nimbus eslint',
        `eslint --color --report-unused-disable-directives ./${srcFolder} ./${testFolder}`,
      )
      .replace('nimbus jest', 'jest --colors')
      .replace('--coverage', '--coverage --logHeapUsage --detectOpenHandles')
      .replace('nimbus prettier', `prettier --write ./${srcFolder} ./${testFolder}`)
      .replace('nimbus typescript', 'tsc')
      .replace('nimbus webpack', 'webpack --colors --progress --bail')
      .replace('nimbus-webpack-server', 'webpack-dev-server')
      .trim();
  });

  pkg.set('scripts', scripts);
  pkg.save();
}

function migrateEslint() {
  const configPath = Path.resolve('.eslintrc.js').path();
  const { extends: extendPaths, ...rootConfig } = require(configPath);
  let config: { extends: string[]; parserOptions?: object } = { extends: [] };

  (extendPaths as string[]).forEach((extendPath) => {
    if (extendPath.startsWith('.')) {
      config = {
        ...config,
        ...require(extendPath),
      };
    } else {
      config.extends.push(extendPath);
    }
  });

  config = {
    ...config,
    ...rootConfig,
  };

  delete config.parserOptions;

  writeJsFile(configPath, config);
}

function migrateJest() {
  const configPath = Path.resolve('jest.config.js').path();
  const config: { [key: string]: unknown } = require(configPath);

  delete config.moduleNameMapper;
  delete config.setupFiles;
  delete config.setupFilesAfterEnv;
  delete config.testEnvironment;

  console.log(
    `${chalk.gray('[jest]')} ${chalk.yellow(
      'Jest config has been migrated but the following settings were removed: moduleNameMapper, setupFiles, setupFilesAfterEnv, testEnvironment',
    )}`,
  );

  console.log(
    `${chalk.gray('[jest]')} ${chalk.yellow(
      'This included custom serializers, transformers, mocks, setup files, and more provided by Nimbus. These will need to be manually configured now.',
    )}`,
  );

  writeJsFile(configPath, config);
}

function migrateWebpack() {
  const configPath = Path.resolve('webpack.config.js').path();
  const url = 'https://github.com/airbnb/nimbus/blob/master/packages/config-webpack/index.js';

  console.log(
    `${chalk.gray('[webpack]')} ${chalk.yellow('Webpack config could not be migrated.')}`,
  );
  console.log(
    `${chalk.gray('[webpack]')} ${chalk.yellow(
      `Please copy portions of this config manually: ${url}`,
    )}`,
  );

  writeJsFile(configPath, {});
}

export async function eject() {
  console.log(BANNER);
  console.log(`${chalk.cyan('[1/5]')} Ejecting Nimbus`);

  const nimbus = editJsonFile(pkgPath).get<NimbusPackage['nimbus']>('nimbus');

  if (!nimbus) {
    throw new Error("Project isn't Nimbus enabled.");
  }

  const response = await prompt<EjectPrompt>([
    {
      type: 'confirm',
      name: 'monorepo',
      message: 'Is this a monorepo?',
    },
    {
      type: 'confirm',
      name: 'yarn',
      message: 'Are you using Yarn?',
    },
  ]);

  await execa('nimbus', ['create-config', '--silent'], { preferLocal: true });

  console.log(`${chalk.cyan('[2/5]')} Updating package scripts`);

  migratePackageScripts(nimbus);

  console.log(`${chalk.cyan('[3/5]')} Migrating drivers`);

  for (const driver of nimbus.drivers) {
    console.log(`${chalk.gray(`[${driver}]`)} Migrating config`);

    if (driver === 'eslint') {
      migrateEslint();
    } else if (driver === 'jest') {
      migrateJest();
    } else if (driver === 'webpack') {
      migrateWebpack();
    }

    console.log(`${chalk.gray(`[${driver}]`)} Updating dependencies`);

    await copyAndInstallDepsFromModule(
      `@airbnb/config-${driver}`,
      response.yarn,
      response.monorepo,
    );

    // Remove the driver from the package in case the eject script fails later on.
    // This allows us to pickup where we left off.
    const pkg = editJsonFile(pkgPath);

    pkg.set(
      'nimbus.drivers',
      (pkg.get('nimbus.drivers') as string[]).filter((d) => d !== driver),
    );
    pkg.save();
  }

  console.log(`${chalk.cyan('[4/5]')} Removing config`);

  await removeDeps(['@airbnb/nimbus'], response.yarn, response.monorepo);

  const pkg = editJsonFile(pkgPath);

  pkg.unset('nimbus');
  pkg.save();

  console.log(`${chalk.cyan('[5/5]')} Updating dotfiles`);

  migrateDotfiles();
}
