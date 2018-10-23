const fs = require('fs')
const index = require('./index')

describe('nunjucksToErb', () => {
  it('should emit template data', () => {
    const result = index.nunjucksToErb('some thing')
    expect(result).toEqual('some thing')
  })

  it('should emit strings', () => {
    const result = index.nunjucksToErb('{{"value"}}')
    expect(result).toEqual("<%= 'value' %>")
  })

  it('should emit booleans', () => {
    const result = index.nunjucksToErb('{{true}}')
    expect(result).toEqual('<%= true %>')
  })

  it('should emit numbers', () => {
    const result = index.nunjucksToErb('{{890237}}')
    expect(result).toEqual('<%= 890237 %>')
  })

  it('should emit strings and template data', () => {
    const result = index.nunjucksToErb('some data {{"value"}} some more data')
    expect(result).toEqual("some data <%= 'value' %> some more data")
  })

  it('should emit symbols', () => {
    const result = index.nunjucksToErb('{{value}}')
    expect(result).toEqual('<%= value %>')
  })

  it('should emit value lookups', () => {
    const result = index.nunjucksToErb('{{value.things}}')
    expect(result).toEqual("<%= value['things'] %>")
  })

  /**
   * Not sure if we actually need this, so not implementing for now.
   */
  xit('should emit function calls', () => {
    const result = index.nunjucksToErb('{{value.method()}}')
    expect(result).toEqual('<%= value.method() %>')
  })

  it('should emit if statements', () => {
    const result = index.nunjucksToErb('{% if true %}Thing{% endif %}')
    expect(result).toEqual('<% if true %>Thing<% end %>')
  })

  it('should emit if statements with string conditionals', () => {
    const result = index.nunjucksToErb("{% if thing == 'value' %}Thing{% endif %}")
    expect(result).toEqual("<% if thing == 'value' %>Thing<% end %>")
  })

  it('should emit for loops', () => {
    const result = index.nunjucksToErb('{% for item in items %}{{item}}{% endfor %}')
    expect(result).toEqual(`<% items.each do |item| %><%= item %><% end %>`)
  })

  it('should emit setters with values', () => {
    const result = index.nunjucksToErb('{% set x = y %}')
    expect(result).toEqual('<% x = y %>')
  })

  it('should emit setters with block', () => {
    const result = index.nunjucksToErb('{% set x %}some value{% endset %}')
    // This ERB is filthy :'(
    expect(result).toEqual(`<% template = <<EOTEMPLATE
some value
EOTEMPLATE
%>
<% x = ERB.new(template, nil, nil, 'erbout_inner').result(binding) %>`)
  })

  it('should emit setters with blocks containing more ERB', () => {
    const result = index.nunjucksToErb(
      '{% set x %}some {{"templated"}} {{"twice"}} value{% endset %}'
    )
    // This ERB is even more filthy :'(
    // Note particularly that the closing %> needs to be escaped with an extra %
    expect(result).toEqual(`<% template = <<EOTEMPLATE
some <%= 'templated' %%> <%= 'twice' %%> value
EOTEMPLATE
%>
<% x = ERB.new(template, nil, nil, 'erbout_inner').result(binding) %>`)
  })

  it('should emit downcase filters', () => {
    const result = index.nunjucksToErb('{{"BANANA" | lower}}')
    expect(result).toEqual("<%= 'BANANA'.downcase %>")
  })

  it('should compile govukButton', () => {
    const nunjucksSource = fs
      .readFileSync(
        __dirname +
          '/node_modules/govuk-frontend/components/button/template.njk'
      )
      .toString()
    const result = index.nunjucksToErb(nunjucksSource)

    // Test with `erb` by prepending <% params = {'element' => 'a', 'attributes' => {'key' => 'value'}} %>
    expect(result).toBe(`<% if params['element'] %>
  <% element = params['element'].downcase %>
<% end %><% template = <<EOTEMPLATE
 class="govuk-button<% if params['classes'] %%> <%= params['classes'] %%><% end %%><% if params['disabled'] %%> govuk-button--disabled<% end %%>"<% params['attributes'].each do |attribute,value| %%> <%= attribute %%>="<%= value %%>"<% end %%>
EOTEMPLATE
%>
<% commonAttributes = ERB.new(template, nil, nil, 'erbout_inner').result(binding) %><% template = <<EOTEMPLATE
<% if params['name'] %%> name="<%= params['name'] %%>"<% end %%> type="<%= params['type'] ? params['type'] : 'submit' %%>"<% if params['disabled'] %%> disabled="disabled" aria-disabled="true"<% end %%>
EOTEMPLATE
%>
<% buttonAttributes = ERB.new(template, nil, nil, 'erbout_inner').result(binding) %><% if element == 'a' %>
<a href="<%= params['href'] ? params['href'] : '#' %>" role="button" draggable="false"<%= commonAttributes.to_s %>>
  <%= params['html'] ? params['html'].to_s : params['text'] %>
</a><% end %>
`)
  })
})
