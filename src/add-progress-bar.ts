import ProgressBar from 'progress'

import {isGoGitItSilentError} from './utils/errors.js'

export default async function addProgressBar (
  text: string | undefined,
  completionCallback: () => Promise<void>
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const contentLength = 2048 * 1024 // 2MB

    if (text) {
      console.log(text)
    }

    const bar = new ProgressBar('[:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 50,
      total: contentLength
    })

    // Simulate progress
    let progress = 0

    const timer = setInterval(() => {
      const chunk = Math.random() * 10 * 1024

      progress += chunk
      bar.tick(chunk)

      if (progress >= contentLength || bar.complete) {
        clearInterval(timer)
      }
    }, 50)

    completionCallback()
      .then(() => {
        clearInterval(timer)

        bar.tick(contentLength)
        resolve()
      })
      .catch((error) => {
        clearInterval(timer)

        if (!isGoGitItSilentError(error)) {
          console.error('[go-git-it] An error occurred:', error)
        }

        reject(error)
      })
  })
}
