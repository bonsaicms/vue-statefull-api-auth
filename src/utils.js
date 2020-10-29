import deepmerge from 'deepmerge'

export function deepMerge (defaultOptions, customOptions) {
  return deepmerge(defaultOptions || {}, customOptions || {}, {
    isMergeableObject (object) {
      return (object !== null && typeof object === 'object' && object.constructor === Object)
    }
  })
}
