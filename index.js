const parser = require('nunjucks/src/parser')

const walk = (cb, node) => {
  const children = node.children || []
  return [cb(node)].concat(...children.map(c => walk(cb, c))).join('')
}

const emitter = node => walk((node) => {
  switch (node.typename) {
    case 'Root':
    case 'NodeList':
    case 'Output':
      // These are just groupings, so we can skip them
      break
    case 'TemplateData':
      return templateDataEmitter(node)
    case 'Symbol':
      return symbolEmitter(node)
    case 'LookupVal':
      return lookupValEmitter(node)
    case 'FunCall':
      if (node.args.children.length) {
        throw new Error('Function calls with arguments are not supported yet')
      }
      return funCallEmitter(node)
    case 'If':
      return ifEmitter(node)
    default:
      console.error(node)
      throw new Error(`Unhandled node type ${node.typename}`)
  }
}, node)
const templateDataEmitter = node => `${node.value}`
const symbolEmitter = node => `<%= ${node.value} %>`
const lookupValEmitter = node => `<%= ${node.target.value}.${node.val.value} %>`
const funCallEmitter = node => `<%= ${node.name.target.value}.${node.name.val.value}() %>`
const ifEmitter = node => `<% if ${node.cond.value} %>${emitter(node.body)}<% end %>`

module.exports = {
  nunjucksToErb: njkInput => {
    const ast = parser.parse(njkInput)
    return emitter(ast)
  }
}
