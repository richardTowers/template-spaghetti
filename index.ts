import {readFileSync} from 'fs'
import compile from './src/njk-react-transpiler'

console.log(compile('Stdin', readFileSync(0, 'utf-8')))
