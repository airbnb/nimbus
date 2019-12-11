import execa from 'execa';

export default async function removeDeps(
  deps: string[],
  isYarn: boolean = false,
  isMonorepo: boolean = false,
) {
  const args: string[] = [];

  if (isYarn) {
    args.push('--dev', '--no-progress');

    if (isMonorepo) {
      args.push('-W');
    }

    await execa('yarn', ['remove', ...args, ...deps]);
  } else {
    args.push('--save-dev');

    await execa('npm', ['uninstall', ...args, ...deps]);
  }
}
