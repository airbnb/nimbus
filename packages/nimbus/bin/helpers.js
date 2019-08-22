const execa = require('execa');
const { version } = require('../package.json');

exports.BANNER = ` _  _  ____  __  __  ____  __  __  ___
( \\( )(_  _)(  \\/  )(  _ \\(  )(  )/ __)
 )  (  _)(_  )    (  ) _ < )(__)( \\__ \\ v${version}
(_)\\_)(____)(_/\\/\\_)(____/ (____) (___/
`;

exports.installDeps = async function installDeps(deps, isYarn, isMonorepo) {
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
};

exports.removeDeps = async function removeDeps(deps, isYarn, isMonorepo) {
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
};
