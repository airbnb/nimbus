import fs from 'fs';
import path from 'path';
import execa from 'execa';
import glob from 'fast-glob';
import Beemo, { BeemoConfig } from '@beemo/core';
import { PackageConfig } from '@boost/core';

export interface NimbusSettings {
  buildFolder: string;
  coverage: number;
  docsFolder: string;
  env: object;
  graphql: boolean;
  library: boolean;
  next: boolean;
  node: boolean;
  react: boolean;
  srcFolder: string;
  testFolder: string;
  typesFolder: string;
}

export interface NimbusPackage extends PackageConfig {
  nimbus: BeemoConfig<Partial<NimbusSettings>>;
}

export { execa, glob };

export function fromRoot(filePath: string, existsCheck: boolean = false): string {
  const absPath = path.join(process.cwd(), filePath);

  if (existsCheck && !fs.existsSync(absPath)) {
    return '';
  }

  return absPath;
}

let pkgCache: NimbusPackage | null = null;

export function getPackage(): NimbusPackage {
  const instance = process.beemo?.tool;

  if (instance?.package) {
    return instance.package as NimbusPackage;
  }

  if (pkgCache) {
    return pkgCache;
  }

  // eslint-disable-next-line
  pkgCache = require(fromRoot('package.json'));

  return pkgCache!;
}

export function getSettings(): NimbusSettings {
  const instance = (process.beemo?.tool as unknown) as Beemo<NimbusSettings>;
  const settings: Partial<NimbusSettings> = {};
  const pkg = getPackage();

  if (instance?.config?.settings) {
    Object.assign(settings, instance.config.settings);
  } else if (pkg.nimbus?.settings) {
    Object.assign(settings, pkg.nimbus.settings);
  }

  return {
    buildFolder: 'lib',
    coverage: 75,
    docsFolder: 'docs',
    env: {},
    graphql: false,
    library: false,
    next: false,
    node: false,
    react: false,
    srcFolder: 'src',
    testFolder: 'test',
    typesFolder: 'types',
    ...settings,
  };
}
