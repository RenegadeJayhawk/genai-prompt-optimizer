import assert from 'node:assert/strict'
import test from 'node:test'
import { copyTextToClipboard } from '../src/clipboard.js'

test('reports success only after the clipboard write completes', async () => {
  let written
  let finish
  const pending = new Promise((resolve) => { finish = resolve })
  const clipboard = { async writeText(text) { written = text; await pending } }
  let completed = false
  const result = copyTextToClipboard('plain prompt text', clipboard).then((value) => {
    completed = true
    return value
  })
  await Promise.resolve()
  assert.equal(completed, false)
  assert.equal(written, 'plain prompt text')
  finish()
  assert.equal(await result, true)
})

test('reports failure when the Clipboard API is absent', async () => {
  assert.equal(await copyTextToClipboard('prompt', null), false)
})

test('reports failure when writeText is unavailable', async () => {
  assert.equal(await copyTextToClipboard('prompt', {}), false)
})

test('reports failure when writeText is not callable', async () => {
  assert.equal(await copyTextToClipboard('prompt', { writeText: true }), false)
})

test('handles denied permissions without rejecting or leaking error details', async () => {
  const clipboard = { writeText: async () => { throw new Error('private browser error details') } }
  assert.equal(await copyTextToClipboard('prompt', clipboard), false)
})

test('handles a synchronous clipboard error', async () => {
  const clipboard = { writeText() { throw new Error('private error') } }
  assert.equal(await copyTextToClipboard('prompt', clipboard), false)
})

test('handles an inaccessible clipboard method', async () => {
  const clipboard = { get writeText() { throw new Error('private accessor error') } }
  assert.equal(await copyTextToClipboard('prompt', clipboard), false)
})

test('validates payloads before invoking the clipboard', async () => {
  let calls = 0
  const clipboard = { async writeText() { calls += 1 } }
  for (const text of [undefined, null, 42, {}, ['prompt']]) {
    assert.equal(await copyTextToClipboard(text, clipboard), false)
  }
  assert.equal(calls, 0)
})

test('preserves the clipboard method receiver and copies literal text', async () => {
  const literal = '<script>alert(1)</script> & "quoted"'
  const clipboard = { async writeText(text) { assert.equal(this, clipboard); assert.equal(text, literal) } }
  assert.equal(await copyTextToClipboard(literal, clipboard), true)
})
