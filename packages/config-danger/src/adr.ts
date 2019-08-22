import { touchedFiles, countChangesInFile, debug, isRevert, TEST_EXT, SNAP_EXT } from './helpers';
import { CommonOptions } from './types';

// Check that large PRs have an associated ADR file documenting the change.
// Ignore lock, tests, and snapshot files in the calculation.
export type CheckAdrOptions = CommonOptions & {
  changeThreshold?: number;
  docsUrl?: string;
  exclusions?: string[];
};

export function checkForADR(docsPath: string, options: CheckAdrOptions = {}) {
  if (isRevert()) {
    return;
  }

  const { changeThreshold = 200, docsUrl = '', exclusions = [] } = options;
  const hasDocsFiles = touchedFiles.some(file => file.includes(docsPath));
  const docsExclusions = [...exclusions, 'package-lock.json', 'yarn.lock', TEST_EXT, SNAP_EXT];
  const modifiedExclusions = danger.git.modified_files.filter(file =>
    docsExclusions.some(ex => !!file.match(ex)),
  );

  Promise.all(modifiedExclusions.map(countChangesInFile)).then(vals => {
    const totalChangeCount = danger.github.pr.additions + danger.github.pr.deletions;
    const exclusionChangeCount = vals.reduce((acc, val) => acc + val, 0);
    const changeCount = totalChangeCount - exclusionChangeCount;

    debug(
      `checkForADR: lines changed total=${totalChangeCount} excluded=${exclusionChangeCount} adjusted=${changeCount}`,
    );

    if (hasDocsFiles) {
      message('Thank you for adding documentation! :tada:');
    } else if (changeCount > changeThreshold) {
      let msg = `This PR has over ${changeThreshold} additions/deletions, but no documentation which describes the changes.`;

      if (docsUrl) {
        msg += ` Consider adding an [ADR](${docsUrl}).`;
      }

      if (options.fail) {
        fail(msg);
      } else {
        warn(msg);
      }
    }
  });
}
