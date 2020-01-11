import { nunjucksNode } from './types'

export function emitWithPlaceholders(parsedNjk: nunjucksNode): {text: string, placeholders: nunjucksNode[]} {
  const placeholders = []
  function convertNunjucksToStringWithPlaceholders(input: nunjucksNode) {
    switch (input.typename) {
      case 'Root':
        return input.children.map(convertNunjucksToStringWithPlaceholders).join('')
      case 'Output':
        return input.children.map(convertNunjucksToStringWithPlaceholders).join('')
      case 'TemplateData':
        return input.value
      default:
        placeholders.push(input)
        return ` x-njk-placeholder="${placeholders.length - 1}" `
    }
  }
  const text = convertNunjucksToStringWithPlaceholders(parsedNjk)
  return { text, placeholders }
}
