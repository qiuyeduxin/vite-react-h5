/**
 * indexDb数据库
 */
import { Dexie, type EntityTable } from 'dexie'
import type { DbLogMsg } from 'src/types'

// 使用可以简单看看这篇文章 https://blog.csdn.net/maply/article/details/144951689
// Database declaration (move this to its own module also)
export const db = new Dexie('baseDb') as Dexie & {
  log: EntityTable<DbLogMsg, 'id' | 'msg'>
}

db.version(1).stores({
  log: '++id, id, msg'
})

export default db
