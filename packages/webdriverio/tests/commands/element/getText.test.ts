import path from 'node:path'
import { expect, describe, it, beforeEach, beforeAll, vi } from 'vitest'

import { remote } from '../../../src/index.js'

vi.mock('fetch')
vi.mock('@wdio/logger', () => import(path.join(process.cwd(), '__mocks__', '@wdio/logger')))

describe('getText test', () => {
    let browser: WebdriverIO.Browser
    let elem: any

    beforeAll(async () => {
        browser = await remote({
            baseUrl: 'http://foobar.com',
            capabilities: {
                browserName: 'foobar'
            }
        })
        elem = await browser.$('#foo')
    })

    beforeEach(() => {
        vi.mocked(fetch).mockClear()
    })

    it('should allow to get the text of an element', async () => {
        await elem.getText()
        // @ts-expect-error mock implementation
        const calls = vi.mocked(fetch).mock.calls.map((call) => call[0]!.pathname)
        expect(calls).toContain('/session/foobar-123/element/some-elem-123/text')
    })

    it('should allow to get the text of an element with rendered option', async () => {
        // Mock the execute response
        // @ts-expect-error mock feature
        fetch.customResponseFor(/execute\/sync/, { value: 'HELLO WORLD' })

        await elem.getText({ rendered: true })
        // @ts-expect-error mock implementation
        const calls = vi.mocked(fetch).mock.calls.map((call) => call[0]!.pathname)
        // Should call element text endpoint
        expect(calls).toContain('/session/foobar-123/element/some-elem-123/text')
        // Should also call execute/sync for rendered text
        expect(calls).toContain('/session/foobar-123/execute/sync')
    })

    it('should allow to get the text with rendered option set to false', async () => {
        await elem.getText({ rendered: false })
        // @ts-expect-error mock implementation
        const calls = vi.mocked(fetch).mock.calls.map((call) => call[0]!.pathname)
        expect(calls).toContain('/session/foobar-123/element/some-elem-123/text')
        // Should NOT call execute/sync when rendered is false
        expect(calls).not.toContain('/session/foobar-123/execute/sync')
    })
})
