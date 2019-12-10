import { Path } from '@beemo/core';
import { IGNORE_PATHS } from '@airbnb/nimbus-common';

export interface ESLintOptions {
  next?: boolean;
  node?: boolean;
  prettier?: boolean;
  typescript?: boolean;
}

function fromHere(filePath: string): string {
  return `./${new Path(process.cwd()).relativeTo(
    new Path(__dirname, '../lib', filePath).resolve(),
  )}`;
}

/**
 * Create a root project config for a project.
 */
export function getExtendsList({
  next = false,
  node = false,
  prettier = false,
  typescript = false,
}: ESLintOptions): string[] {
  const paths = [fromHere('presets/base.js')];

  // Future rules
  if (next) {
    paths.push(fromHere('presets/next.js'));
  }

  // TypeScript
  if (typescript) {
    paths.push(fromHere('presets/typescript.js'));
  }

  // Node
  if (node) {
    paths.push(fromHere('presets/node.js'));
  }

  // Prettier (must be last)
  if (prettier) {
    paths.push(fromHere('presets/prettier.js'));

    if (typescript) {
      paths.push('prettier/@typescript-eslint');
    }

    if (next) {
      paths.push('prettier/unicorn');
    }
  }

  return paths;
}

/**
 * Return a list of common files to ignore.
 */
export function getIgnoreList(): string[] {
  return [...IGNORE_PATHS];
}
