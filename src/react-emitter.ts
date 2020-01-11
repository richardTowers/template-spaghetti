import { builders as b } from "ast-types"
// @ts-ignore
import * as util from 'util'

function emitArray(nodes: any[]) {
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

function emitElement(node: any) {
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

function emitSymbol(node: any) {
  return b.memberExpression(
    b.identifier('props'),
    b.identifier(node.value)
  )
}

function emit(node) {
  if (node instanceof Array) {
    return emitArray(node)
  } else if (typeof node === 'string') {
    return emitString(node)
  } else if (node.type === 'element') {
    return emitElement(node)
  } else if (node.typename === 'Symbol') {
    return emitSymbol(node)
  } else {
    throw new Error(`Node '${util.inspect(node)}' is not supported`)
  }
}

export function emitReactComponent(name: string, htmlNjkAst: any[]) {
  return b.program([
    b.functionDeclaration(
      b.identifier(name),
      [b.identifier('props')],
      b.blockStatement([
        b.returnStatement(emit(htmlNjkAst.filter(x => x !== '\n')))
      ]),
    )
  ])
}