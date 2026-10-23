export async function copyTextToClipboard(text, clipboard) {
  if (typeof text !== 'string') return false

  try {
    const target = clipboard === undefined ? globalThis.navigator?.clipboard : clipboard
    if (typeof target?.writeText !== 'function') return false
    await target.writeText(text)
    return true
  } catch {
    // Do not expose browser permission errors or report an unsuccessful copy as success.
    return false
  }
}
