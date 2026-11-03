import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { pathToFileURL } from "node:url"
import { expect, it } from "vitest"
import { PAGE_CODEC_VERSION, parsePageMarkdown, serializePageMarkdown } from "./index"

it("releases detached codec windows after successful and rejected work in cadenced and synchronous calls", async () => {
  const require = createRequire(import.meta.url)
  const happyRoot = dirname(require.resolve("happy-dom"))
  const { default: WindowBrowserContext } = await import(pathToFileURL(join(happyRoot, "window/WindowBrowserContext.js")).href)
  const symbols = await import(pathToFileURL(join(happyRoot, "PropertySymbol.js")).href)
  const frames = WindowBrowserContext[symbols.browserFrames] as Map<number, { page: { close(): Promise<void> } }>
  const initialIds = new Set(frames.keys())
  const runCycle = () => {
    const parsed = parsePageMarkdown("<u>Synthetic lifecycle</u>")
    expect(parsed).toMatchObject({ ok: true, version: PAGE_CODEC_VERSION })
    if (!parsed.ok) throw new Error("Expected successful parsing")
    const serialized = serializePageMarkdown(parsed.value.toJSON(), PAGE_CODEC_VERSION)
    expect(serialized).toMatchObject({ ok: true, value: "<u>Synthetic lifecycle</u>" })
    expect(parsePageMarkdown('<p unsupported="true">Rejected</p>')).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
  }
  try {
    for (let cycle = 0; cycle < 6; cycle++) {
      runCycle()
      await new Promise<void>(resolve => setImmediate(resolve))
      expect(frames.size).toBe(initialIds.size)
    }
    for (let cycle = 0; cycle < 6; cycle++) runCycle()
    expect(frames.size).toBe(initialIds.size)
    await new Promise<void>(resolve => setImmediate(resolve))
    expect(frames.size).toBe(initialIds.size)
  } finally {
    for (const [id, frame] of [...frames]) if (!initialIds.has(id)) await frame.page.close()
  }
})

it("releases rejected local iframe child windows after bounded asynchronous cleanup", async () => {
  const require = createRequire(import.meta.url)
  const happyRoot = dirname(require.resolve("happy-dom"))
  const { default: WindowBrowserContext } = await import(pathToFileURL(join(happyRoot, "window/WindowBrowserContext.js")).href)
  const symbols = await import(pathToFileURL(join(happyRoot, "PropertySymbol.js")).href)
  const frames = WindowBrowserContext[symbols.browserFrames] as Map<number, { page: { close(): Promise<void> } }>
  const initialIds = new Set(frames.keys())
  try {
    const parsed = parsePageMarkdown('<iframe src="about:blank"></iframe>')
    expect(parsed).toMatchObject({ ok: false, error: { code: "unsupported_content" } })
    expect(parsed).not.toBeInstanceOf(Promise)
    const deadline = Date.now() + 1000
    while (frames.size !== initialIds.size && Date.now() < deadline) await new Promise<void>(resolve => setTimeout(resolve, 5))
    expect(frames.size).toBe(initialIds.size)
  } finally {
    for (const [id, frame] of [...frames]) if (!initialIds.has(id)) await frame.page.close()
  }
})
