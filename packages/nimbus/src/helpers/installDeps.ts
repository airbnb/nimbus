import execa from 'execa';

export default async function installDeps(
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

    await execa('yarn', ['add', ...args, ...deps]);
  } else {
    args.push('--save-dev');

    await execa('npm', ['install', ...args, ...deps]);
  }
}
