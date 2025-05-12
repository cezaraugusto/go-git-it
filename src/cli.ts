#!/usr/bin/env node

type GoGitIt = (gitURL: string, outputDirectory?: string) => Promise<void>;

export default function cli(goGitIt: GoGitIt) {
  const args = process.argv;

  // CLI needs at least one argument to run
  if (args.length < 3) {
    console.log('You need to provide a valid GitHub URL to start a download.');
    process.exit();
  }

  // Execute CLI with one argument
  if (args.length === 3) {
    goGitIt(args[args.length - 1]);
  }

  // Execute CLI with two argument
  if (args.length === 4) {
    goGitIt(args[args.length - 2], args[args.length - 1]);
  }
}
