Template Spaghetti
==================

Converts nunjucks templates into React components.

Aims to be able to convert the components in alphagov/govuk-frontend to React.

What?
-----

`govuk-frontend` provides a number of nunjucks templates, which make it
easier to build applications using nunjucks as your templating enine.

It would be nice if we could compile these into React components, so people
using React could get the same productivity boost.

A simple example would be to convert the nunjucks in `hello.njk`:

```html
<p>Hello {{name}}</p>
```

Into this React component:

```js
function Hello(props) {
  return React.createElement('p', {}, `Hello ${props.name}`)
}
```

Why is this difficult?
----------------------

Because nunjucks is a string templating language and React works with the DOM
(i.e. it knows about elements and attributes), we have to parse the template
both as nunjucks and HTML.

Running an HTML parser on a raw nunjucks template isn't viable. For example
the following won't parse sensibly:

```html
<p {{ class="big" if params.big else class="small" }}>Hello</p>
```

We can do a bit better by parsing first as nunjucks, replacing each bit of
nunjucks with a placeholder, and then parsing the result as HTML. We can then
use the placeholders to understand the context for each bit of nunjucks (e.g.
is it producing flow content? or setting attributes?)

So we have an intermediate step like:

```html
<p x-nunjucks-placeholder="0">Hello</p>
```

We can then use the nunjucks to generate code to build the attributes, so
we'll end up with something like:

```js
function Hello(props) {
  const attrs = {}
  attrs['className'] = props.big ? 'big' : 'small'
  return React.createElement('p', attrs, 'Hello')
}
```

This approach might be good enough for most nunjucks found in the wild, but
it's not possible in the general case as not all templates will be
well-formed HTML once all the nunjucks is replaced with placeholders.
