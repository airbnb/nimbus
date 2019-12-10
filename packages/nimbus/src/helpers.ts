import execa from 'execa';

const { version } = require('../package.json');

export const BANNER = ` _  _  ____  __  __  ____  __  __  ___
( \\( )(_  _)(  \\/  )(  _ \\(  )(  )/ __)
 )  (  _)(_  )    (  ) _ < )(__)( \\__ \\ v${version}
(_)\\_)(____)(_/\\/\\_)(____/ (____) (___/
`;

export async function installDeps(
  deps: string[],
  isYarn: boolean = false,
  isMonorepo: boolean = false,
) {
  const args = [];

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

export async function removeDeps(
  deps: string[],
  isYarn: boolean = false,
  isMonorepo: boolean = false,
) {
  const args = [];

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
