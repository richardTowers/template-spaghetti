import compileToAst from '../src/njk-react-transpiler'
import {parseScript} from 'esprima'

const nunjucksTemplate = `<p>Hello {{name}}</p>`
const reactComponent = `function Hello(props) { return React.createElement('p', {}, 'Hello ' + props.name) }`

describe('hello example', () => {
  it('should compile to the golden example', () => {
    const result = compileToAst('Hello', nunjucksTemplate)
    expect(parseScript(result)).toEqual(parseScript(reactComponent))
  })
})
