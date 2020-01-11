import * as parse5 from 'parse5'
import { nunjucksNode } from './types'

// TODO - clean up the type that this returns - it's annoying to work with at the moment
export function replacePlaceholders(documentFragment: parse5.DefaultTreeDocumentFragment, placeholders: nunjucksNode[]): any[] {
  function expandPlaceholderAttr(attr) {
    return attr
  }

  function expandPlaceholderString(text: string) {
    const result = []
    const placeholderRegex = / x-njk-placeholder="(\d+)" /g
    let matchIndex = 0
    let match: RegExpExecArray
    do {
      match = placeholderRegex.exec(text)
      if (match) {
        result.push(text.slice(matchIndex, match.index))
        matchIndex = match.index + match[0].length
        result.push(placeholders[+match[1]])
      } else {
        const remainder = text.slice(matchIndex)
        if (remainder.length > 0) {
          result.push(remainder)
        }
      }
    } while(match)
    return result
  }

  function emit(acc: any[], node: parse5.DefaultTreeNode): any[] {
    if (node.nodeName === '#document-fragment') {
      return acc.concat((node as parse5.DefaultTreeDocumentFragment).childNodes.reduce(emit, []))
    }
    else if (node.nodeName === '#text') {
      const text = node as parse5.DefaultTreeTextNode
      return acc.concat(expandPlaceholderString(text.value))
    }
    else if ((node as any).attrs) {
      const elem = node as parse5.DefaultTreeElement
      return [...acc, {
        type: 'element',
        name: elem.tagName,
        childNodes: elem.childNodes.reduce(emit, []),
        attrs: (elem.attrs || []).map(expandPlaceholderAttr)
      }]
    }
    else {
      throw new Error(`Unknown nodeName ${node.nodeName}`)
    }
  }
  return emit([], documentFragment)
}