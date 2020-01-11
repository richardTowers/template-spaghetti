import * as parse5 from 'parse5'
import { Node, HtmlAttributeNode, NunjucksNode, RawStringNode, HtmlElementNode } from './types'

export function replacePlaceholders(documentFragment: parse5.DefaultTreeDocumentFragment, placeholders: any[]): Node[] {
  function expandPlaceholderAttr(attr: parse5.Attribute): HtmlAttributeNode {
    return new HtmlAttributeNode(attr)
  }

  function expandPlaceholderString(text: string): (NunjucksNode | RawStringNode)[] {
    const result: (NunjucksNode | RawStringNode)[] = []
    const placeholderRegex = / x-njk-placeholder="(\d+)" /g
    let matchIndex = 0
    let match: RegExpExecArray
    do {
      match = placeholderRegex.exec(text)
      if (match) {
        result.push(new RawStringNode(text.slice(matchIndex, match.index)))
        matchIndex = match.index + match[0].length
        result.push(new NunjucksNode(placeholders[+match[1]]))
      } else {
        const remainder = text.slice(matchIndex)
        if (remainder.length > 0) {
          result.push(new RawStringNode(remainder))
        }
      }
    } while(match)
    return result
  }

  function emit(acc: Node[], node: parse5.DefaultTreeNode): Node[] {
    if (node.nodeName === '#document-fragment') {
      return acc.concat((node as parse5.DefaultTreeDocumentFragment).childNodes.reduce(emit, []))
    }
    else if (node.nodeName === '#text') {
      const text = node as parse5.DefaultTreeTextNode
      return acc.concat(expandPlaceholderString(text.value))
    }
    else if ((node as any).attrs) {
      const elem = node as parse5.DefaultTreeElement
      return [...acc, new HtmlElementNode({
        type: 'element',
        name: elem.tagName,
        childNodes: elem.childNodes.reduce(emit, []),
        attrs: (elem.attrs || []).map(expandPlaceholderAttr)
      })]
    }
    else {
      throw new Error(`Unknown nodeName ${node.nodeName}`)
    }
  }
  return emit([], documentFragment)
}