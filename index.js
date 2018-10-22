const parser = require('nunjucks/src/parser')

const walk = cb => node => (
  cb(node),
  node.children &&
    node.children.forEach(child => walk(cb)(child))
)

const templateDataEmitter = result => node => `${result}${node.value}`
const symbolEmitter = result => node => `${result}<%= ${node.value} %>`
const lookupValEmitter = result => node => `${result}<%= ${node.target.value}.${node.val.value} %>`
const funCallEmitter = result => node => `${result}<%= ${node.name.target.value}.${node.name.val.value}() %>`
const ifEmitter = result => node => `<% if ${node.cond.value} %>TODO - implement the body<% end %>`

module.exports = {
  nunjucksToErb: njkInput => {
    let result = ''
    const ast = parser.parse(njkInput)
    walk((node) => {
      switch (node.typename) {
        case 'Root':
        case 'Output':
          // These are just groupings, so we can skip them
          break
        case 'TemplateData':
          result = templateDataEmitter(result)(node)
          break
        case 'Symbol':
          result = symbolEmitter(result)(node)
          break
        case 'LookupVal':
          result = lookupValEmitter(result)(node)
          break
        case 'FunCall':
          if (node.args.children.length) {
            throw new Error('Function calls with arguments are not supported yet')
          }
          result = funCallEmitter(result)(node)
          break
        case 'If':
          // TODO this doesn't work yet because we need to recurse to print the
          // body and I haven't got the code right yet
          result = ifEmitter(result)(node)
          break
        default:
          console.error(node)
          throw new Error(`Unhandled node type ${node.typename}`)
      }
    })(ast)
    return result
  }
}
