
export function fixCDDL(content: string): string {
    content = content.replace(/{\s*script\.\w+\s*}/g, 'any')

    const operators = ['default', 'size', 'regexp', 'bits', 'and', 'within', 'eq', 'ne', 'lt', 'le', 'gt', 'ge']
    const targetIdentifier = 'session.ProxyConfiguration'

    let i = 0
    while (i < content.length) {
        // Check for comment
        if (content[i] === ';') {
            let end = content.indexOf('\n', i)
            if (end === -1) {end = content.length}
            i = end
            continue
        }

        // Check for string
        if (content[i] === '"') {
            let end = i + 1
            while (end < content.length) {
                if (content[end] === '"') {
                    end++
                    break
                }
                if (content[end] === '\\') {
                    end++
                }
                end++
            }
            i = end
            continue
        }

        // Check for targetIdentifier assignment
        // Look for "session.ProxyConfiguration" followed by optional whitespace, then "="
        if (content.startsWith(targetIdentifier, i)) {
            // Ensure we are at the start of an identifier (e.g. check previous char is whitespace or start of file)
            const prevChar = i > 0 ? content[i - 1] : ' '
            if (/\s/.test(prevChar)) {
                let j = i + targetIdentifier.length
                // Skip whitespace
                while (j < content.length && /\s/.test(content[j])) {j++}

                if (content[j] === '=') {
                    // Found assignment!
                    // Now find the end of the assignment value.
                    // CDDL assignment ends at the start of the next assignment?
                    // But we want to handle `{ ... }` explicitly if it starts with it.

                    let k = j + 1
                    while (k < content.length && /\s/.test(content[k])) {k++}

                    if (content[k] === '{') {
                        // It's a map/group definition. Find matching '}'
                        let openCount = 1
                        let p = k + 1
                        let endBrace = -1

                        while (p < content.length) {
                            if (content[p] === ';') { // Skip comments
                                let end = content.indexOf('\n', p)
                                if (end === -1) {end = content.length}
                                p = end
                                continue
                            }
                            if (content[p] === '"') { // Skip strings
                                p++
                                while (p < content.length) {
                                    if (content[p] === '"') {break}
                                    if (content[p] === '\\') {p++}
                                    p++
                                }
                                p++
                                continue
                            }

                            if (content[p] === '{') { openCount++ } else if (content[p] === '}') {
                                openCount--
                                if (openCount === 0) {
                                    endBrace = p
                                    break
                                }
                            }
                            p++
                        }

                        if (endBrace !== -1) {
                            const replacement = `${targetIdentifier} = any`
                            const before = content.slice(0, i)
                            const after = content.slice(endBrace + 1)
                            content = before + replacement + after

                            // Adjust i to skip the replacement
                            i = before.length + replacement.length
                            continue
                        }
                    }
                }
            }
        }

        // Check for operator .op (
        if (content[i] === '.') {
            // Check if it matches an operator
            let matchedOp = null
            for (const op of operators) {
                if (content.startsWith(op, i + 1)) {
                    const afterOp = content[i + 1 + op.length]
                    if (!afterOp || /\s|\(/.test(afterOp)) {
                        matchedOp = op
                        break
                    }
                }
            }

            if (matchedOp) {
                let j = i + 1 + matchedOp.length
                while (j < content.length && /\s/.test(content[j])) {j++}

                if (content[j] === '(') {
                    let k = j + 1
                    while (k < content.length) {
                        if (/\s/.test(content[k])) {
                            k++
                            continue
                        }
                        if (content[k] === ';') {
                            let end = content.indexOf('\n', k)
                            if (end === -1) {end = content.length}
                            k = end
                            continue
                        }
                        break
                    }
                    if (k < content.length && /\d/.test(content[k])) {
                        i = k
                        continue
                    }

                    // Not a number, remove parens!
                    let openCount = 1
                    let p = j + 1
                    let endParen = -1

                    while (p < content.length) {
                        if (content[p] === ';') {
                            let end = content.indexOf('\n', p)
                            if (end === -1) {end = content.length}
                            p = end
                            continue
                        }
                        if (content[p] === '"') {
                            p++
                            while (p < content.length) {
                                if (content[p] === '"') {break}
                                if (content[p] === '\\') {p++}
                                p++
                            }
                            p++
                            continue
                        }

                        if (content[p] === '(') {openCount++} else if (content[p] === ')') {
                            openCount--
                            if (openCount === 0) {
                                endParen = p
                                break
                            }
                        }
                        p++
                    }

                    if (endParen !== -1) {
                        const before = content.slice(0, j)
                        const inside = content.slice(j + 1, endParen)
                        const after = content.slice(endParen + 1)

                        content = before + ' ' + inside + after

                        i = 0 // Restart safely
                        continue
                    }
                }
            }
        }

        i++
    }

    return content
}
