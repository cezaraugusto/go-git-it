export class GoGitItSilentError extends Error {
  public readonly silent = true;

  constructor(message: string) {
    super(message);
    this.name = 'GoGitItSilentError';
  }
}

export function isGoGitItSilentError(error: unknown): boolean {
  return (
    error instanceof GoGitItSilentError ||
    (typeof error === 'object' &&
      error !== null &&
      (error as { silent?: boolean }).silent === true)
  );
}
