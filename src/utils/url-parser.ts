export interface GitHubUrlData {
  owner: string;
  project: string;
  branch: string;
  filePath: string;
  isMainRepo: boolean;
  isReleaseAsset: boolean;
  isFile: boolean;
  downloadUrl?: string;
}

const DEFAULT_BRANCH = 'main';
const GITHUB_DOMAIN = 'github.com';

export function parseGitHubUrl(gitUrl: string): GitHubUrlData {
  try {
    const url = new URL(gitUrl);

    if (!url.hostname.includes(GITHUB_DOMAIN)) {
      throw new Error(
        `Unsupported domain: ${url.hostname}. Only GitHub URLs are supported.`,
      );
    }

    const pathSegments = url.pathname
      .split('/')
      .filter((segment) => segment.length > 0);

    if (pathSegments.length < 2) {
      throw new Error('Invalid GitHub URL: Missing owner or repository name');
    }

    const owner = pathSegments[0];
    const project = pathSegments[1];

    // Handle release assets
    if (isReleaseAssetUrl(pathSegments)) {
      return parseReleaseAssetUrl(owner, project, pathSegments);
    }

    // Handle regular repository URLs
    return parseRepositoryUrl(owner, project, pathSegments);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse GitHub URL: ${error.message}`);
    }
    throw error;
  }
}

function isReleaseAssetUrl(pathSegments: string[]): boolean {
  return pathSegments.includes('releases') && pathSegments.includes('download');
}

function parseReleaseAssetUrl(
  owner: string,
  project: string,
  pathSegments: string[],
): GitHubUrlData {
  const releaseIndex = pathSegments.findIndex(
    (segment) => segment === 'releases',
  );
  const downloadIndex = pathSegments.findIndex(
    (segment) => segment === 'download',
  );

  if (
    releaseIndex === -1 ||
    downloadIndex === -1 ||
    downloadIndex !== releaseIndex + 1
  ) {
    throw new Error('Invalid release asset URL format');
  }

  const tag = pathSegments[downloadIndex + 1];
  const assetName = pathSegments[downloadIndex + 2];

  if (!tag || !assetName) {
    throw new Error('Missing release tag or asset name in URL');
  }

  const filePath = pathSegments.slice(releaseIndex).join('/');
  const downloadUrl = `https://github.com/${owner}/${project}/releases/download/${tag}/${assetName}`;

  return {
    owner,
    project,
    branch: DEFAULT_BRANCH, // Not applicable for releases
    filePath,
    isMainRepo: false,
    isReleaseAsset: true,
    isFile: true,
    downloadUrl,
  };
}

function parseRepositoryUrl(
  owner: string,
  project: string,
  pathSegments: string[],
): GitHubUrlData {
  // Check for blob/tree indicators
  const blobIndex = pathSegments.findIndex((segment) => segment === 'blob');
  const treeIndex = pathSegments.findIndex((segment) => segment === 'tree');
  const indicatorIndex = blobIndex !== -1 ? blobIndex : treeIndex;

  let branch = DEFAULT_BRANCH;
  let filePath = '';
  let isFile = false;

  if (indicatorIndex !== -1) {
    // URL has blob/tree structure: /owner/repo/blob|tree/branch/path...
    if (pathSegments.length <= indicatorIndex + 1) {
      throw new Error('Invalid URL: Missing branch after blob/tree indicator');
    }

    branch = pathSegments[indicatorIndex + 1];
    filePath = pathSegments.slice(indicatorIndex + 2).join('/');
    // blob indicates file, tree indicates folder
    isFile = blobIndex !== -1;
  } else if (pathSegments.length > 2) {
    // URL might be: /owner/repo/path... (assume main branch)
    filePath = pathSegments.slice(2).join('/');
    // Try to infer if it's a file based on extension
    isFile = hasFileExtension(filePath);
  }

  const isMainRepo = !filePath || filePath === project;

  return {
    owner,
    project,
    branch,
    filePath: filePath || project,
    isMainRepo,
    isReleaseAsset: false,
    isFile: isFile && !isMainRepo,
    downloadUrl: undefined,
  };
}

function hasFileExtension(path: string): boolean {
  const segments = path.split('/');
  const lastSegment = segments[segments.length - 1];
  return lastSegment.includes('.') && !lastSegment.startsWith('.');
}

export function isValidGitHubUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.includes(GITHUB_DOMAIN);
  } catch {
    return false;
  }
}

export function generateApiUrls(data: GitHubUrlData) {
  const baseUrl = `https://api.github.com/repos/${data.owner}/${data.project}`;

  return {
    repository: baseUrl,
    branches: `${baseUrl}/branches`,
    contents:
      data.filePath && !data.isMainRepo
        ? `${baseUrl}/contents/${data.filePath}?ref=${data.branch}`
        : `${baseUrl}/contents?ref=${data.branch}`,
    releases: `${baseUrl}/releases`,
    archive: `${baseUrl}/zipball/${data.branch}`,
  };
}

export function getOutputDirectoryName(data: GitHubUrlData): string {
  if (data.isReleaseAsset) {
    // For release assets, use the filename
    const segments = data.filePath.split('/');
    return segments[segments.length - 1];
  }

  if (data.isMainRepo) {
    // For full repos, use the project name (like git clone)
    return data.project;
  }

  // For subfolders/files, use the basename
  const segments = data.filePath.split('/');
  return segments[segments.length - 1];
}
