import { browser, $, expect } from '@wdio/globals'

describe('issue #13977: Pageload hangs with Mock.request', () => {
    it('should navigate within site with auth header without hanging', async () => {
        const mock = await browser.mock('https://the-internet.herokuapp.com/**', {
            method: 'get'
        })

        mock.request((req) => {
            const headers: Record<string, string> = {}
            req.request.headers.forEach((header) => {
                headers[header.name] = header.value.value
            })
            headers['Authorization'] = `Basic ${btoa('admin:admin')}`
            headers['x-test-header'] = 'true'
            return headers
        })

        await browser.url('https://the-internet.herokuapp.com/')
        const link = await $('=Basic Auth')
        await link.click()

        // Validation: Verify we landed on the basic auth page
        const header = await $('h3')
        await expect(header).toHaveText('Basic Auth')
    })
})
