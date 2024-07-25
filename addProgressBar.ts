// @ts-ignore
import ProgressBar from "progress";

export default async function addProgressBar(
  text: string,
  completionCallback: () => Promise<void>
): Promise<void> {
  await new Promise<void>(async (resolve, reject) => {
    const contentLength = 2048 * 1024; // 2MB
    const bar = new ProgressBar(`${text} [:bar] :percent :etas`, {
      complete: "=",
      incomplete: " ",
      width: 50,
      total: contentLength,
    });

    // Simulate progress
    let progress = 0;

    const timer = setInterval(() => {
      const chunk = Math.random() * 10 * 1024;
      progress += chunk;
      bar.tick(chunk);
      if (progress >= contentLength || bar.complete) {
        // Clear interval when progress is complete
        clearInterval(timer);
      }
    }, 50);

    try {
      // Wait for the cloning operation to complete
      await completionCallback();

      // Ensure the interval is cleared after operation completes
      clearInterval(timer);

      // Force-complete the progress bar
      bar.tick(contentLength);
      resolve();
    } catch (error) {
      // Ensure the interval is cleared in case of error
      clearInterval(timer);

      console.error("[go-git-it] An error occurred:", error);
      reject(error);
    }
  });
}
