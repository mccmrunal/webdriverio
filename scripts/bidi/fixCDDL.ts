
export function fixCDDL(content: string): string {
    const operators = ['default', 'size', 'regexp', 'bits', 'and', 'within', 'eq', 'ne', 'lt', 'le', 'gt', 'ge']

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

        // Check for operator .op (
        if (content[i] === '.') {
            // Check if it matches an operator
            let matchedOp = null
            for (const op of operators) {
                if (content.startsWith(op, i + 1)) {
                    const afterOp = content[i + 1 + op.length]
                    // op should be followed by space or ( or start of comment?
                    // Technically it can be followed by anything that is not an identifier char.
                    // But in our case we look for (.
                    if (!afterOp || /\s|\(/.test(afterOp)) {
                        matchedOp = op
                        break
                    }
                }
            }

            if (matchedOp) {
                // Check if followed by (
                let j = i + 1 + matchedOp.length
                // Skip whitespace
                while (j < content.length && /\s/.test(content[j])) {j++}

                if (content[j] === '(') {
                    // Check if followed by number (grouped range)
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
                        // It is a number, keep parens
                        i = k
                        continue
                    }

                    // Not a number, remove parens!

                    // Find matching paren
                    let openCount = 1
                    let p = j + 1
                    let endParen = -1

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

                        // Restart scan to safely handle nested or subsequent operators
                        i = 0
                        continue
                    }
                }
            }
        }

        i++
    }

    return content
}
