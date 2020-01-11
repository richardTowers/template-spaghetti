import * as parse5 from 'parse5'

export class NunjucksNode {
  constructor(public readonly data: any) {}
}

export interface IHtmlElement {
  type: 'element',
  name: string,
  childNodes: Node[],
  attrs: HtmlAttributeNode[]
}
export class HtmlElementNode {
  constructor(public readonly data: IHtmlElement) {}
}

export class HtmlAttributeNode {
  constructor(public readonly data: parse5.Attribute) {}
}

export class RawStringNode {
  constructor(public readonly data: string) {}
}

export type Node = NunjucksNode | HtmlElementNode | HtmlAttributeNode | RawStringNode
