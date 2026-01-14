/**
 *
 * Get the text content from a DOM-element. Make sure the element
 * you want to request the text from [is interactable](http://www.w3.org/TR/webdriver/#interactable)
 * otherwise you will get an empty string as return value. If the element is disabled or not
 * visible and you still want to receive the text content use [getHTML](https://webdriver.io/docs/api/element/getHTML)
 * as a workaround.
 *
 * <example>
    :index.html
    <div id="elem">
        Lorem ipsum <strong>dolor</strong> sit amet,<br />
        consetetur sadipscing elitr
    </div>
    <span style="display: none">I am invisible</span>
    :getText.js
    it('should demonstrate the getText function', async () => {
        const elem = await $('#elem');
        console.log(await elem.getText());
        // outputs the following:
        // "Lorem ipsum dolor sit amet,consetetur sadipscing elitr"

        const span = await $('span');
        console.log(await span.getText());
        // outputs "" (empty string) since element is not interactable
    });
    it('get content from table cell', async () => {
        await browser.url('http://the-internet.herokuapp.com/tables');
        const rows = await $$('#table1 tr');
        const columns = await rows[1].$$('td'); // get columns of 2nd row
        console.log(await columns[2].getText()); // get text of 3rd column
    });
 * </example>
 *
 * @alias element.getText
 * @param {GetTextOptions} options optional options for getText
 * @return {String} content of selected element (all HTML tags are removed)
 * @uses protocol/elements, protocol/elementIdText
 * @type property
 *
 */
export interface GetTextOptions {
    /**
     * If set to true, returns the rendered text considering CSS text-transform properties.
     * If false (default), returns the text content as defined in the DOM.
     * @default false
     */
    rendered?: boolean
}

export async function getText (
    this: WebdriverIO.Element,
    options: GetTextOptions = {}
): Promise<string> {
    const text = await this.getElementText(this.elementId)

    // If rendered option is not set or false, return the DOM text as-is
    if (!options.rendered) {
        return text
    }

    // If rendered option is true, compute the actual rendered text considering CSS transformations
    return this.execute((element: Element) => {
        const computedStyle = window.getComputedStyle(element)
        const textTransform = computedStyle.textTransform || 'none'
        const renderedText = element.textContent || ''

        // Apply text-transform styles to the text
        switch (textTransform) {
        case 'uppercase':
            return renderedText.toUpperCase()
        case 'lowercase':
            return renderedText.toLowerCase()
        case 'capitalize':
            // Capitalize first letter of each word
            return renderedText.replace(/\b\w/g, (char) => char.toUpperCase())
        case 'full-width':
            // This is more complex, just return as-is for now
            return renderedText
        case 'full-size-kana':
            // This is more complex, just return as-is for now
            return renderedText
        case 'none':
        case 'initial':
        case 'inherit':
        default:
            return renderedText
        }
    }) as Promise<string>
}
