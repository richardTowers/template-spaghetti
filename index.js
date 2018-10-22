const parser = require('nunjucks/src/parser')

// mode = 'plain'||'output'||'code'
const emitter = (mode, node) => {
  switch (node.typename) {
    case 'Root':
    case 'NodeList':
      if (node.children) {
        return node.children.map(child => emitter(mode, child)).join('')
      } else {
        return ''
      }
    case 'Output':
      return outputEmitter(mode, node)
    case 'TemplateData':
      return templateDataEmitter(mode, node)
    case 'Symbol':
      return symbolEmitter(mode, node)
    case 'LookupVal':
      return lookupValEmitter(mode, node)
    case 'FunCall':
      if (node.args.children.length) {
        throw new Error('Function calls with arguments are not supported yet')
      }
      return funCallEmitter(mode, node)
    case 'If':
      return ifEmitter(mode, node)
    case 'Set':
      return setEmitter(mode, node)
    case 'Filter':
      return filterEmitter(mode, node)
    case 'Capture':
      return captureEmitter(mode, node)
    case 'Compare':
      return compareEmitter(mode, node)
    case 'InlineIf':
      return inlineIfEmitter(mode, node)
    case 'Literal':
      return literalEmitter(mode, node)
    default:
      console.error(node)
      throw new Error(`Unhandled node type ${node.typename}`)
  }
}

const single = arr => {
  if(arr.length === 1) {
    return arr[0]
  } else {
    throw new Error(`Expected to find exactly one element, but found ${arr.length}`)
  }
}
const startOutputTag      = mode => mode !== 'plain' ? '' : '<%= '
const endOutputTag        = mode => mode !== 'plain' ? '' : ' %>'
const startCodeTag        = mode => mode !== 'plain' ? '' : '<% '
const endCodeTag          = mode => mode !== 'plain' ? '' : ' %>'
const outputEmitter       = (mode, node) => `${node.children.map(child => emitter(mode, child))}`
const templateDataEmitter = (mode, node) => `${node.value}`
const symbolEmitter       = (mode, node) => `${startOutputTag(mode)}${node.value}${endOutputTag(mode)}`
const lookupValEmitter    = (mode, node) => `${startOutputTag(mode)}${emitter('output', node.target)}.${emitter('output', node.val)}${endOutputTag(mode)}`
const funCallEmitter      = (mode, node) => `${startOutputTag(mode)}${emitter('output', node.name.target)}.${emitter('output', node.name.val)}()${endOutputTag(mode)}`
const ifEmitter           = (mode, node) => `${startCodeTag(mode)}if ${emitter('code', node.cond)}${endCodeTag(mode)}${emitter('plain', node.body)}<% end %>`
const inlineIfEmitter     = (mode, node) => `${startOutputTag(mode)}${emitter('output', node.cond)} ? ${emitter('output', node.body)} : ${emitter('output', node.else_)}${endOutputTag(mode)}`
const setEmitter          = (mode, node) => `${startCodeTag(mode)}${emitter('code', single(node.targets))} = ${emitter('code', node.value || node.body)}${endCodeTag(mode)}`
const filterEmitter       = (mode, node) => `TODO(filter)`
const captureEmitter      = (mode, node) => `TODO(capture)`
const compareEmitter      = (mode, ndoe) => `TODO(compare)`
const literalEmitter      = (mode, node) => `${node.value}`

module.exports = {
  nunjucksToErb: njkInput => {
    const ast = parser.parse(njkInput)
    return emitter('plain', ast)
  }
}

