import originalDayjs from 'dayjs'
import { customAlphabet } from 'nanoid'
import * as nanoIdDictionary from 'nanoid-dictionary'

const { alphanumeric } = nanoIdDictionary

export const generateId = (): string => {
  return customAlphabet(alphanumeric, 10)()
}

export const dayjs = originalDayjs

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ')
}
