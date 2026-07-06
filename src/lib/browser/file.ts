/** Trigger a client-side download of `content` as a text file. */
export function downloadText(
  content: string,
  filename: string,
  mimeType = 'application/json',
): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

/**
 * Open the OS file picker and resolve with the chosen file's name and text
 * content, or null if the user cancels.
 */
export function pickTextFile(
  accept = '.json,application/json,text/plain',
): Promise<{ name: string; content: string } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept

    input.addEventListener('change', () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(null)
        return
      }
      const reader = new FileReader()
      reader.onload = () =>
        resolve({ name: file.name, content: String(reader.result ?? '') })
      reader.onerror = () => resolve(null)
      reader.readAsText(file)
    })

    // Some browsers require the input to be in the DOM for cancel handling.
    input.style.display = 'none'
    document.body.appendChild(input)
    input.click()
    input.addEventListener('blur', () => input.remove(), { once: true })
  })
}
