import originalDayjs from 'dayjs'

export const dayjs = originalDayjs

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ')
}