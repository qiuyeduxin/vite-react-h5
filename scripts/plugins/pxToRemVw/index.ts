import type { Plugin } from 'vite'
import postcssrc from 'postcss-load-config'
import {
  blacklistedSelector,
  createPropListMatcher,
  createPxReplace,
  declarationExists,
  defaultOptions,
  pxRegex,
  typeFns
} from './utils'
import {
  PxToRemVwOptions,
  type ExcludeFn,
  type ExcludeReg,
  type ExcludeString,
  type Options
} from './types'

function isObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

/**
 * Converts px units to rem or vw units for CSS processing.
 * This function primarily accepts configuration options to customize the conversion behavior.
 *
 * @param options Custom configuration options for converting px to rem or vw.
 * @returns Returns a postcss plugin configuration object for processing CSS.
 */
function pxRem(options: PxToRemVwOptions) {
  // Merge user options with default options to ensure all configuration items have values.
  const opts: Options = Object.assign({}, defaultOptions, options)

  // Create a function to match properties that need unit conversion.
  const satisfyPropList = createPropListMatcher(opts.propList)

  // Get the list of files or conditions to exclude from conversion.
  const exclude = opts.exclude

  // Initialize a variable to mark if the current file should be excluded from conversion.
  let isExcludeFile = false

  // Create a function to replace px units with rem units.
  const pxReplaceRem = createPxReplace(
    opts.rootValue,
    opts.unitPrecision,
    opts.minPixelValue,
    'rem'
  )

  // Create a function to replace px units with vw units.
  const pxReplaceVw = createPxReplace(
    opts.rootValue / 100,
    opts.unitPrecision,
    opts.minPixelValue,
    'vw'
  )

  // Return a postcss plugin configuration object.
  return {
    postcssPlugin: 'postcss-pxtorem',

    // The Once method is executed once before processing the CSS.
    Once(css: Record<string, any>) {
      // Get the file path of the CSS being processed.
      const filePath = css.source.input.file as string
      isExcludeFile = false

      // Determine if the current file meets the exclusion conditions.
      const cond1: boolean = typeFns.isFunction(exclude) && (exclude as ExcludeFn)(filePath)
      const cond2: boolean =
        typeFns.isString(exclude) && filePath.indexOf(exclude as ExcludeString) !== -1
      const cond3: boolean = filePath.match(exclude as ExcludeReg) !== null
      if (exclude && (cond1 || cond2 || cond3)) {
        isExcludeFile = true
      }
    },

    // The Declaration method processes each CSS declaration.
    Declaration(decl: any) {
      // Skip processing if the current file should be excluded.
      if (isExcludeFile) return

      // Process only if the declaration value contains px units, and the property is not in the blacklist and does not match the selector blacklist.
      if (
        decl.value.indexOf(opts.unit) === -1 ||
        !satisfyPropList(decl.prop) ||
        blacklistedSelector(opts.selectorBlackList, decl.parent.selector)
      )
        return

      // Replace px units with rem units in the declaration value.
      const sourceValue = decl.value
      const value = sourceValue.replace(pxRegex(opts.unit), pxReplaceRem)

      // if rem unit already exists, do not add or replace
      if (declarationExists(decl.parent, decl.prop, value)) return

      // Update the declaration value.
      decl.value = value

      // If the property is not in the force rem property list, also add a vw unit declaration.
      if (!opts.forceRemPropList.includes(decl.prop)) {
        decl.cloneAfter({
          value: sourceValue.replace(pxRegex(opts.unit), pxReplaceVw)
        })
      }
    },

    // The AtRule method processes @rules, such as @media queries.
    AtRule(atRule: Record<string, any>) {
      // Skip processing if the current file should be excluded.
      if (isExcludeFile) return

      // Process only if the configuration enables media query conversion and the current @rule is a media query.
      if (opts.mediaQuery && atRule.name === 'media') {
        if (atRule.params.indexOf(opts.unit) === -1) return
        atRule.params = atRule.params.replace(pxRegex(opts.unit), pxReplaceRem)
      }
    }
  }
}

const PLUGIN_NAME = 'vite-plugin-px2remOrVw'
export default function pxToRemVwPlugin(opts: PxToRemVwOptions): Plugin {
  return {
    name: PLUGIN_NAME,
    async config(config) {
      const postCssOptions = config.css?.postcss
      const pluginInfo = pxRem(opts)
      let cssConfig = {
        css: {
          postcss: {
            plugins: [pluginInfo]
          }
        }
      }
      if (isObject(postCssOptions)) {
        return cssConfig
      } else {
        const searchPath = typeof postCssOptions === 'string' ? postCssOptions : config.root
        // load postcss config
        try {
          const result = await postcssrc({}, searchPath)
          result.plugins.push(pluginInfo)
          return {
            css: {
              postcss: result
            }
          }
        } catch (error) {
          return cssConfig
        }
      }
    }
  }
}
