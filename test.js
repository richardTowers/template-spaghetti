const index = require('./index')

describe('nunjucksToErb', () => {
  it('should emit template data', () => {
    const result = index.nunjucksToErb('some thing')
    expect(result).toEqual('some thing')
  })

  it('should emit symbols', () => {
    const result = index.nunjucksToErb('key = {{value}}')
    expect(result).toEqual('key = <%= value %>')
  })

  it('should emit value lookups', () => {
    const result = index.nunjucksToErb('key = {{value.things}}')
    expect(result).toEqual('key = <%= value.things %>')
  })

  it('should emit function calls', () => {
    const result = index.nunjucksToErb('key = {{value.method()}}')
    expect(result).toEqual('key = <%= value.method() %>')
  })

  it('should emit if statements', () => {
    const result = index.nunjucksToErb('key = {% if true %}Thing{% endif %}')
    expect(result).toEqual('key = <% if true %>Thing<% end %>')
  })
})
