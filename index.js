const parser = require('nunjucks/src/parser')

const emitForNodeType = typename => {
  return {
    Root: rootEmitter,
    NodeList: nodeListEmitter,
    Output: outputEmitter,
    TemplateData: templateDataEmitter,
    Symbol: symbolEmitter,
    LookupVal: lookupValEmitter,
    If: ifEmitter,
    Set: setEmitter,
    Filter: filterEmitter,
    Capture: captureEmitter,
    For: forEmitter,
    Array: arrayEmitter,
    Compare: compareEmitter,
    InlineIf: inlineIfEmitter,
    Literal: literalEmitter
  }[typename]
}

const emit = node => {
  const _emit = emitForNodeType(node.typename)
  if (!_emit) {
    console.error(node)
    throw new Error(`Unhandled node type ${node.typename}`)
  }
  return _emit(node)
}

const single = arr => {
  if (arr.length === 1) {
    return arr[0]
  } else {
    throw new Error(
      `Expected to find exactly one element, but found ${arr.length}`
    )
  }
}
function nodeListEmitter(node) {
  if (node.children) {
    return node.children.map(child => emit(child)).join('')
  } else {
    return ''
  }
}

function rootEmitter(node) {
  return nodeListEmitter(node)
}

function outputEmitter(node) {
  return node.children.map(child => {
    const out = emit(child)
    if (child.typename === 'TemplateData') {
      return out
    }
    return `<%= ${out} %>`
  })
}

function templateDataEmitter(node) {
  return `${node.value}`
}

function symbolEmitter(node) {
  return `${node.value}`
}

function lookupValEmitter(node) {
  return `${emit(node.target)}[${emit(node.val)}]`
}

function ifEmitter(node) {
  return `<% if ${emit(node.cond)} %>${emit(node.body)}<% end %>`
}

function inlineIfEmitter(node) {
  return `${emit(node.cond)} ? ${emit(node.body)} : ${emit(node.else_)}`
}

function setEmitter(node) {
  if (node.value) {
    return `<% ${emit(single(node.targets))} = ${emit(
      node.value || node.body
    )} %>`
  }
  return `<% template = <<EOTEMPLATE
${emit(node.body).replace(/%>/g, '%%>')}
EOTEMPLATE
%>
<% ${emit(
    single(node.targets)
  )} = ERB.new(template, nil, nil, 'erbout_inner').result(binding) %>`
}

function filterMap(filter) {
  switch (filter) {
    case 'lower':
      return 'downcase'
    case 'safe':
      return 'to_s' // TODO bad idea lol
    default:
      throw new Error(`Unrecognised filter ${filter}`)
  }
}

function filterEmitter(node) {
  return `${emit(node.args)}.${filterMap(node.name.value)}`
}

function captureEmitter(node) {
  return `${emit(node.body)}` // TODO this probably won't work
}

function forEmitter(node) {
  return `<% ${emit(node.arr)}.each do |${emit(node.name)}| %>${emit(node.body)}<% end %>`
}

function arrayEmitter(node) {
  return node.children.map(child => emit(child)).join(',')
}

function compareEmitter(node) {
  return `${emit(node.expr)} ${node.ops[0].type} ${emit(node.ops[0].expr)}`
}

function literalEmitter(node) {
  if (/^true|false|[0-9]+$/.test(node.value)) {
    return node.value
  }
  return `'${node.value}'`
}

module.exports = {
  nunjucksToErb: njkInput => {
    const ast = parser.parse(njkInput)
    return emit(ast)
  }
}
