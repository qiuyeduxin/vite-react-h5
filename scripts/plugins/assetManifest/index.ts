import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

export default function assetManifestPlugin(): Plugin {
  const fileMap = new Map()
  return {
    name: 'vite-plugin-asset-manifest',
    enforce: 'post',
    generateBundle(_options: any, bundle) {
      const entrys: Record<string, any>[] = []
      for (const key in bundle) {
        const chunk: Record<string, any> = {
          ...bundle[key],
          modules: [],
          code: '',
          source: '',
          moduleIds: []
        }
        if (chunk.isEntry) {
          entrys.push(chunk)
        }
      }
      entrys.forEach((entry) => {
        const jsonMap: Record<string, any> = {}
        // entry html
        const htmlName = entry.name.replace(/.(js|ts)/g, '.html')
        jsonMap[htmlName] = htmlName.replace('src/pages', '')
        const loopChunk = (chunk: Record<string, any>) => {
          if (!chunk) {
            return
          }
          const { name, fileName, originalFileName } = chunk
          let jsonKey = name
          if (!chunk.isEntry) {
            jsonKey = originalFileName || fileName
            if (path.extname(jsonKey) !== path.extname(fileName)) {
              jsonKey = `index${path.extname(fileName)}`
            }
          }

          if (jsonMap[jsonKey]) {
            // 防止循环依赖
            return
          }

          jsonMap[jsonKey] = fileName

          if (chunk.dynamicImports) {
            const newList: string[] = []
            newList
              .concat(chunk.dynamicImports || [])
              .concat(chunk.imports || [])
              .forEach((dynamicImport: string) => {
                loopChunk(bundle[dynamicImport] as Record<string, any>)
              })
          }

          if (chunk?.viteMetadata?.importedAssets) {
            for (const assetName of [...chunk.viteMetadata.importedAssets]) {
              loopChunk(bundle[assetName] as Record<string, any>)
            }
          }

          if (chunk?.viteMetadata?.importedCss) {
            for (const assetName of [...chunk.viteMetadata.importedCss]) {
              loopChunk(bundle[assetName] as Record<string, any>)
            }
          }
        }
        loopChunk(entry)
        fileMap.set(
          path.resolve(
            process.cwd(),
            `${path.parse(entry.name.replace('src/pages', 'dist')).dir}/asset-manifest.json`
          ),
          JSON.stringify(jsonMap, null, 2)
        )
      })

      return Promise.resolve(fileMap) as any
    },
    closeBundle() {
      fileMap.forEach((value, key) => {
        fs.writeFileSync(key, value, 'utf-8')
      })
    }
  }
}
