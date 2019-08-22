export const IS_SRC = /src\//;
export const IS_TEST = /tests?\//;
export const JS_EXT = /\.jsx?$/;
export const SRC_EXT = /\.(t|j)sx?$/;
export const TEST_EXT = /\.test\.(t|j)sx?$/;
export const SNAP_EXT = /\.snap$/;
export const GLOBAL_IGNORE = /Icon[A-Z][a-zA-Z]+\.(t|j)sx$/;

export const updatedFiles = [...danger.git.created_files, ...danger.git.modified_files];

export const touchedFiles = [
  ...danger.git.created_files,
  ...danger.git.deleted_files,
  ...danger.git.modified_files,
];

export function debug(msg: string, ...args: string[]) {
  if (danger.git.modified_files.includes('dangerfile.js')) {
    message(`[debug] ${msg}`, ...args);
  }
}

export function isRevert(): boolean {
  return (
    danger.github.pr.title.startsWith('Revert') ||
    danger.github.pr.title.includes('Automatic revert')
  );
}

export async function countChangesInFile(file: string): Promise<number> {
  return new Promise(resolve => {
    danger.git.diffForFile(file).then(d => {
      const added = (d && d.added && d.added.split('\n').length) || 0;
      const removed = (d && d.removed && d.removed.split('\n').length) || 0;

      resolve(added + removed);
    });
  });
}
