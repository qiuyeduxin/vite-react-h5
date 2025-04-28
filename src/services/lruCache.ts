/**
 * 最近最少使用换成算法
 * new LruCache(限制的个数)
 */

class DLinkedNode<T> {
  key: string
  value: any
  prev: DLinkedNode<T> | null
  next: DLinkedNode<T> | null
  constructor(key: string, value: T) {
    this.key = key
    this.value = value
    this.prev = null
    this.next = null
  }
}

class LruCache<T> {
  limit: number
  head: DLinkedNode<T> | null
  tail: DLinkedNode<T> | null
  map: Map<string, DLinkedNode<T>>
  size: number
  constructor(limit: number) {
    this.limit = limit || 10
    // head 指针指向表头元素，即为最常用的元素
    this.head = this.tail = null
    this.map = new Map()
    this.size = 0
  }

  get(key: any, ifReturnNode?: any) {
    // 如果查找不到含有`key`这个属性的缓存对象
    if (!this.map.has(key)) return

    const node = this.map.get(key) as DLinkedNode<T>
    this.moveToHead(node)
    return ifReturnNode ? node : node.value
  }

  addToHead(node: DLinkedNode<T>) {
    if (this.head) {
      this.head.prev = node
      node.next = this.head
      this.head = node
    } else {
      this.head = node
      this.tail = node
    }
  }

  removeNode(node: DLinkedNode<T>) {
    if (node.prev) {
      node.prev.next = node.next
    }

    if (node.next) {
      node.next.prev = node.prev
    }
  }

  moveToHead(node: DLinkedNode<T>) {
    this.removeNode(node)
    this.addToHead(node)
  }

  removeTail(): DLinkedNode<T> | null {
    const node: DLinkedNode<T> | null = this.tail
    if (!node) return null
    this.removeNode(node)
    this.tail = node.prev
    return node
  }

  set(key: string, value: T) {
    // 之前的算法可以直接存k-v但是现在要把简单的 k-v 封装成一个满足双链表的节点
    // 1.查看是否已经有了该节点
    if (!this.map.has(key)) {
      const node = new DLinkedNode<T>(key, value)
      this.map.set(key, node)
      this.addToHead(node)
      this.size++ // 减少一个缓存槽位
      if (this.size > this.limit) {
        // 如果超出容量，删除双向链表的尾部节点
        const removed = this.removeTail()
        if (removed) {
          this.map.delete(removed.key)
        }
        this.size--
      }
    } else {
      const node = this.map.get(key) as DLinkedNode<T>
      node.value = value
      this.moveToHead(node)
    }
  }
}

export default LruCache
