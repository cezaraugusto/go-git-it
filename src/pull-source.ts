export default function pullSource(branch: string) {
  return `git pull origin --quiet ${branch} --depth 1`;
}
