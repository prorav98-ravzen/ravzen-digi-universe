/** Bound untrusted JSON before parsing or validating collections. */
export async function readBoundedJson(request: Request, maxBytes = 256 * 1024): Promise<unknown> {
  const declared = request.headers.get('content-length')
  if (declared && Number(declared) > maxBytes) throw new Error('Request too large')
  if (!request.body) throw new Error('Missing request body')
  const reader = request.body.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let size = 0
  let text = ''
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) { await reader.cancel(); throw new Error('Request too large') }
      text += decoder.decode(value, { stream: true })
    }
    text += decoder.decode()
    return JSON.parse(text)
  } finally { reader.releaseLock() }
}
