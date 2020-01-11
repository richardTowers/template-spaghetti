import { builders as b } from "ast-types"
import { Node, RawStringNode, HtmlElementNode, NunjucksNode, IHtmlElement } from './types'

// @ts-ignore
import * as util from 'util'

function emitArray(nodes: Node[]) {
  if (nodes.length === 0) {
    return b.noop()
  } else if (nodes.length === 1) {
    return emit(nodes[0])
  } else {
    return b.binaryExpression('+',
      emit(nodes[0]),
      emit(nodes.slice(1))
    )
  }
}

function emitString(node: string) {
  return b.literal(node)
}

function emitElement(node: IHtmlElement) {
  if (node.attrs.length > 0) {
    throw new Error('attributes are not supported yet')
  }
  return b.callExpression(
    b.memberExpression(
      b.identifier('React'),
      b.identifier('createElement'),
    ),
    [
      b.literal(node.name),
      b.objectExpression([]),
      emit(node.childNodes),
    ],
  )
}

function emitNunjucks(node: any) {
  return b.memberExpression(
    b.identifier('props'),
    b.identifier(node.value)
  )
}

function emit(node: Node[] | Node) {
  if (node instanceof Array) {
    return emitArray(node)
  } else if (node instanceof RawStringNode) {
    return emitString(node.data)
  } else if (node instanceof HtmlElementNode) {
    return emitElement(node.data)
  } else if (node instanceof NunjucksNode) {
    return emitNunjucks(node.data)
  } else {
    throw new Error(`Node '${util.inspect(node)}' is not supported`)
  }
}

export function emitReactComponent(name: string, htmlNjkAst: Node[]) {
  return b.program([
    b.functionDeclaration(
      b.identifier(name),
      [b.identifier('props')],
      b.blockStatement([
        b.returnStatement(emit(htmlNjkAst.filter(x => x.data !== '\n')))
      ]),
    )
  ])
}