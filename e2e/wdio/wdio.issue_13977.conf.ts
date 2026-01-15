import { config as baseConfig } from './wdio.conf.js'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export const config: WebdriverIO.Config = {
    ...baseConfig,
    specs: [
        path.join(__dirname, 'headless', 'issue_13977.e2e.ts')
    ],
    capabilities: [{
        browserName: 'chrome',
        browserVersion: 'stable',
        'goog:chromeOptions': {
            args: [
                'disable-infobars',
                'disable-gpu'
            ]
        },
        webSocketUrl: true
    }]
}
