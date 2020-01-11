import {generate} from 'escodegen'
import * as nunjucks from 'nunjucks/src/parser'
import * as parse5 from 'parse5'

import { emitWithPlaceholders } from './nunjucks-placeholder-emitter'
import { replacePlaceholders } from './placeholder-replacer'
import { emitReactComponent } from './react-emitter'

export default function compile(name: string, njkInput: string) {
  const parsedNunjucks = nunjucks.parse(njkInput)
  const {text: textWithPlaceholders, placeholders} = emitWithPlaceholders(parsedNunjucks)
  const parsedHtmlWithPlaceholders = parse5.parseFragment(textWithPlaceholders) as parse5.DefaultTreeDocumentFragment
  const parsedHtmlAndNunjucks = replacePlaceholders(parsedHtmlWithPlaceholders, placeholders)
  const reactComponent = emitReactComponent(name, parsedHtmlAndNunjucks)
  return generate(reactComponent)
}
