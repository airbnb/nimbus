# Contributing

## Developer setup

To contribute to Nimbus, begin by cloning the repository, installing dependencies, and building
initial files.

```bash
git clone git@github.com:airbnb/nimbus.git && cd ./nimbus
yarn install
yarn run build
```

Nimbus uses [Yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) to manage multiple
packages as a monorepo, and [Beemo](https://github.com/beemojs/beemo) as the configuration and
management layer.

### Workflow

- `yarn run build` will build applicable packages.
- `yarn run eslint` will run lint all source and test files.
- `yarn run jest` will run the test suite.
- `yarn run prettier` will format code.
- `yarn test` will test, lint, and build.

## Reporting bugs

Please report all bugs as [an issue](https://github.com/airbnb/nimbus/issues/new) on the Nimbus
repository. Before filing a new issue, try to make sure your problem doesn’t already exist.

## Requesting new features

If you work for Airbnb, please create an issue and start a discussion about the feature you want
added to Nimbus, and why.

Otherwise, we will not be accepting new features from individuals outside of Airbnb.

## Releasing and versioning

Nimbus uses [conventional commits](https://www.conventionalcommits.org) and
[Lerna](https://github.com/lerna/lerna) to automatically release and publish new package versions
for every commit that merges to master. To ensure versions are bumped correctly, we use the
[conventional-changelog-beemo][conventional-changelog-beemo] preset, coupled with PR titles and
squash merging to achieve this.

If your PR title does not match the specification, a DangerJS status check will fail.

## Code formatting

We use an automatic code formatter called [Prettier](https://prettier.io/). Run `yarn run prettier`
after making any changes to the code, or setup your editor to automatically format on save.

Our linter will catch most issues that may exist in your code.

## Updating dependencies

To update dependencies in Nimbus, run `yarn upgrade-interactive --latest` in the root of the
project. This will display an interactive menu in which you can select dependencies to update (to
the latest version) using the space bar and arrow keys.

However, there are a few caveats and requirements to follow when updating.

1. Dependencies should be updated in isolation per package (workspace), and commited to git
   separately. For example, only dependencies within the `@airbnb/config-jest` package should be
   updated within a single commit.
   - This allows packages to update and version independently from each other.
   - The exception to this is when a dependency is used across many packages, like Babel being used
     in Jest and Webpack. The preferred solution is to update all Babel dependencies first, across
     all packages, in the same commit. Subsequent commits would isolate Jest and Webpack separately.
2. Format your commit message with the `deps` prefix, along the lines of
   `deps: Update plugins to latest.` or `deps(ESLint): Update to v6.`. This message format follows
   the [conventional-changelog-beemo][conventional-changelog-beemo] spec.
3. Commit all dependency updates in the same branch, so they can be grouped under the same PR. Once
   the PR has been approved, normal merge (_not a squash or rebase merge_) the PR so all commits and
   their formatted messages are sent to master. This will trigger an auto-release with the correct
   version bumps.

<!-- prettier-ignore -->
[conventional-changelog-beemo]: https://github.com/beemojs/conventional-changelog-beemo#commit-message-format
