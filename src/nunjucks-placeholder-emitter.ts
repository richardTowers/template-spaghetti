export function emitWithPlaceholders(parsedNjk: any): {text: string, placeholders: any[]} {
  const placeholders = []
  function convertNunjucksToStringWithPlaceholders(input: any) {
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
