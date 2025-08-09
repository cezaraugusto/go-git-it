#!/usr/bin/env node

type GoGitIt = (gitURL: string, outputDirectory?: string) => Promise<void>;

/**
 * Enhanced CLI with proper error handling and help text
 */
export default function cli(goGitIt: GoGitIt): void {
  const args = process.argv.slice(2); // Remove 'node' and script name

  // Show help text
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
go-git-it - Download GitHub repositories, folders, or files

USAGE:
  go-git-it <github-url> [directory]

EXAMPLES:
  # Clone entire repository (like git clone)
  go-git-it https://github.com/owner/repo
  go-git-it https://github.com/owner/repo ./my-projects

  # Download specific folder
  go-git-it https://github.com/owner/repo/tree/main/src
  
  # Download specific file
  go-git-it https://github.com/owner/repo/blob/main/README.md
  
  # Download release asset
  go-git-it https://github.com/owner/repo/releases/download/v1.0.0/asset.zip

For more information, visit: https://github.com/cezaraugusto/go-git-it
`);
    process.exit(0);
  }

  // Validate arguments
  if (args.length < 1 || args.length > 2) {
    console.error('Error: Invalid number of arguments.');
    console.error('Usage: go-git-it <github-url> [directory]');
    console.error('Use --help for more information.');
    process.exit(1);
  }

  const gitUrl = args[0];
  const outputDirectory = args[1];

  // Execute with proper error handling
  (async () => {
    try {
      await goGitIt(gitUrl, outputDirectory);
    } catch (error) {
      console.error(
        'Error:',
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  })();
}
