export const extend = Object.assign

export const isObject = function (val) {
  return val !== null && (typeof val === 'object')
}

export const isString = (value) => typeof value === 'string'

export const hasChanged = function (value, newValue) {
  return Object.is(value, newValue)
}

export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)

export const isOn = (key) => /^on[A-Z]/.test(key)

export const EMPRY_OBJ = {}

export * from './toDisplayString'