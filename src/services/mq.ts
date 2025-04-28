/**
 * 生产消费模式
 * 模拟MQ，可以用来处理并发请求， 不同的topic之间互不影响
 */

/**
 * @example 测试例子
import { Consumer, Mq, Producer } from 'src/services/mq'
const mProducer = new Producer('xxx')
// 自定义消费者
class MConsumer extends Consumer {
  constructor({ topic, limit }: { topic: string; limit: number }) {
    const mq = new Mq({ name: topic }) // 一个mq实例对应一个topic通道
    super({ topic, limit })
    mProducer.topic = topic
  }

  async run(msg: Msg) {
    // 重写父类方法
    await msg?.extra?.runTask()
    this.next(msg) // 消息消费结束要回调，告诉mq让消息从队列中移除
  }

  addTask(task: Record<string, any>) {
    mProducer.create({ ...task, extra: { runTask: task.run } })
  }
}

// 测试
new MConsumer({ topic: 'test', limit: 2 }).addTask({
  run: () =>
    new Promise((resolve) =>
      setTimeout(() => {
        resolve(1)
        console.log('一个任务结束了')
      }, 1000)
    )
})
 */

import { getUuid } from 'src/utils'
import Event from './event'

export const mqEvents = new Event()

export interface Msg {
  id: string
  priority: number // 权重
  ctime: number
  extra?: Record<string, any> // 额外信息
}

export interface DataType {
  id: string
  limit: number
}

export interface ProduceMsg {
  priority?: number // 权重
  extra?: Record<string, any>
}

type BindConsumer = { id: string; queue: string[]; limit: number; updateTime: number }

type ConsumerMsg = {
  consumerId: string
  msg: Msg
}

type CreateMsg = {
  id: string
  priority?: number
  extra?: Record<string, any>
}

function createMsg({ id, priority, extra }: CreateMsg): Msg {
  const newTask: Msg = {
    id: id || getUuid(),
    priority: priority || 0,
    // 创建时间，用于定期清理长时间未触发消费的消息
    ctime: Date.now(),
    extra
  }

  return newTask
}

export class Mq {
  id: string
  name: string
  queue: Msg[]
  limit: number
  consumerLimit: number
  consumerExpireTime: number
  consumerMap: Map<string, BindConsumer>
  msgConsumerMap: Map<string, string>
  listenerMap: Map<string, Function>

  constructor(options: {
    name?: string
    limit?: number
    consumerLimit?: number
    consumerExpireTime?: number
  }) {
    this.id = getUuid()
    this.name = options.name || ''
    this.queue = [] // 消息主队列，目前不限制
    this.limit = options.limit || 1e5 // 消息主队列长度限制
    this.consumerLimit = options.consumerLimit || 1e3 // 消息者的个数限制
    this.consumerExpireTime = options.consumerExpireTime || 259200000 // 消息者为活跃期限，默认三天
    this.consumerMap = new Map() // 绑定的消费者
    this.msgConsumerMap = new Map() // 消费中消息和消费者绑定关系
    this.listenerMap = new Map()
    this.initEvents()
  }

  initEvents() {
    const enqueueFn = this.enqueue.bind(this)
    const dequeueFn = this.dequeue.bind(this)
    const bindConsumerFn = this.bindConsumer.bind(this)
    const unbindConsumerFn = this.unbindConsumer.bind(this)
    const getMsgFn = this.getMsg.bind(this)

    this.listenerMap.set(`${this.name}_enqueue`, enqueueFn)
    this.listenerMap.set(`${this.name}_dequeue`, dequeueFn)
    this.listenerMap.set(`${this.name}_bindConsumer`, bindConsumerFn)
    this.listenerMap.set(`${this.name}_unbindConsumer`, unbindConsumerFn)
    this.listenerMap.set(`${this.name}_getMsg`, getMsgFn)

    const listeners = [...this.listenerMap]
    listeners.forEach(([evName, listener]) => {
      mqEvents.on(evName, listener)
    })
  }

  // 推送一条消息进队
  enqueue(msg: CreateMsg) {
    if (this.isFull()) {
      throw new Error(`mq ${this.name} is full`)
    }
    this.queue.unshift(createMsg(msg))
    this.notifyAll()
  }

  // 出队
  dequeue(msg: Msg) {
    if (!this.msgConsumerMap.has(msg.id)) {
      throw new Error('can not find msgId=' + msg.id)
    }
    const consumerId = this.msgConsumerMap.get(msg.id) as string
    this.msgConsumerMap.delete(msg.id)
    if (this.consumerMap.has(consumerId)) {
      const consumer = this.consumerMap.get(consumerId) as BindConsumer
      this.consumerMap.set(consumerId, {
        ...consumer,
        queue: consumer.queue.filter((id: string) => id !== msg.id)
      })
    }
  }

  // 通知所有消费者
  notifyAll() {
    mqEvents.emit(`${this.name}_notify`)
  }

  // 绑定消费者
  bindConsumer(data: DataType) {
    const now = Date.now()

    // 清理过期未活跃的消费者
    const consumerList = [...this.consumerMap]
    if (consumerList.length > this.consumerLimit) {
      const delConsumers: BindConsumer[] = []
      let retryMsgs: string[] = []
      consumerList.forEach(([id, consumer]) => {
        if (now - consumer.updateTime > this.consumerExpireTime) {
          // consumerExpireTime未活动的消费者，清理掉
          this.consumerMap.delete(id)
          delConsumers.push(consumer)
        }
      })
      const msgConsumerMapList = [...this.msgConsumerMap]
      msgConsumerMapList.forEach(([msgId, consumerId]) => {
        const consumer = delConsumers.find((item) => item.id === consumerId)
        if (consumer) {
          this.msgConsumerMap.delete(msgId)
          retryMsgs = retryMsgs.concat(consumer.queue)
        }
      })
      retryMsgs.forEach((msgId) => {
        this.enqueue({
          id: msgId
        })
      })
    }

    if (consumerList.length > this.consumerLimit) {
      // 如果经过清理还是满了，那就报错
      throw new Error('consumer is full ' + this.consumerLimit)
    }

    this.consumerMap.set(data.id, {
      id: data.id,
      queue: [],
      limit: data.limit,
      updateTime: now // 更新时间，用于定期清理长时间未活动的消费者，节约内存
    })

    if (!this.isEmpty()) {
      // 如果还有消息积累，需要触发下消费
      this.notifyAll()
    }
  }

  // 解绑消费者
  unbindConsumer({ id }: { id: string }) {
    // 将所有关于该消费者的子队列消息全部删除
    const msgs = this.consumerMap.get(id)?.queue || []
    msgs.forEach((msgId) => {
      this.msgConsumerMap.delete(msgId)
    })
    this.consumerMap.delete(id)
    // 重新推送未消费的消息
    msgs.forEach((msgId) => {
      this.enqueue({
        id: msgId
      })
    })
  }

  // 给某个消费者批量获取一个消息进行消费
  getMsg({ id: consumerId }: { id: string }) {
    const consumer = this.consumerMap.get(consumerId)
    if (!consumer) {
      throw new Error(`consumer（${consumerId}）并不存在`)
    }

    const oldMsgs = consumer.queue
    // 先进的先出
    if (oldMsgs.length >= consumer.limit || this.isEmpty()) {
      return
    }

    // 每次取一个消息
    let msgIndex = this.queue.length - 1
    let msg = this.queue[msgIndex]
    for (let i = this.queue.length - 1; i >= 0; i--) {
      if (this.queue[i].priority > msg.priority) {
        msg = this.queue[i]
        msgIndex = i
      }
    }
    if (!msg) {
      return
    }
    this.queue.splice(msgIndex, 1)
    // 将获取的消息放进和消费者绑定的子队列中
    this.consumerMap.set(consumerId, {
      ...consumer,
      queue: [...oldMsgs, msg.id]
    })
    this.msgConsumerMap.set(msg.id, consumerId)

    mqEvents.emit(`${this.name}_consumeMsg`, {
      consumerId: consumer.id,
      msg
    } as ConsumerMsg)
  }

  isEmpty() {
    return !this.queue.length
  }

  isFull() {
    return this.queue.length === this.limit
  }

  clearMsg() {
    this.queue = []
    this.msgConsumerMap = new Map()
  }

  clearAll() {
    this.clearMsg()
    this.consumerMap = new Map()
  }

  destroy() {
    const listeners = [...this.listenerMap]
    listeners.forEach(([evName, listener]) => {
      mqEvents.off(evName, listener)
    })
    this.clearAll()
  }
}

// 生产者
export class Producer {
  topic: string = ''
  id: string = ''

  constructor(topic: string) {
    this.topic = topic
    this.id = getUuid()
  }

  create(msg: ProduceMsg) {
    mqEvents.emit(`${this.topic}_enqueue`, msg)
  }
}

// 消费者
export class Consumer {
  id: string
  topic: string
  limit: number
  listenerMap: Map<string, Function>
  constructor({ topic, limit = 2 }: { topic: string; limit?: number }) {
    this.id = getUuid()
    this.topic = topic
    this.limit = limit
    this.listenerMap = new Map()
    this.init()
  }

  init() {
    const self = this
    mqEvents.emit(`${this.topic}_bindConsumer`, {
      id: this.id,
      limit: this.limit
    })

    const notifyFn = this.getMsg.bind(this)
    const consumeMsgFn = (data: ConsumerMsg) => {
      if (data.consumerId === this.id) {
        self.run(data.msg)
      }
    }
    this.listenerMap.set(`${this.topic}_notify`, notifyFn)
    this.listenerMap.set(`${this.topic}_consumeMsg`, consumeMsgFn)

    const listeners = [...this.listenerMap]
    listeners.forEach(([evName, listener]) => {
      mqEvents.on(evName, listener)
    })
  }

  // 执行获取消息逻辑进行消费
  run(_msg: Msg) {}

  getMsg() {
    setTimeout(() => {
      mqEvents.emit(`${this.topic}_getMsg`, {
        id: this.id
      })
    }, 0)
  }

  // 消费结束后告知mq
  next(msg: any) {
    mqEvents.emit(`${this.topic}_dequeue`, msg)
    this.getMsg()
  }

  destroy() {
    mqEvents.emit(`${this.topic}_unbindConsumer`, {
      id: this.id
    })
    const listeners = [...this.listenerMap]
    listeners.forEach(([evName, listener]) => {
      mqEvents.off(evName, listener)
    })
  }
}
