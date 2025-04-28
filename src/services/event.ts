class Event {
  private handlers = new Map()

  /**
   * Register an event handler for the given type.
   * @param {string|symbol} type Type of event to listen for, or `'*'` for all events
   * @param {Function} handler Function to call in response to given event
   * @memberOf mitt
   */
  on(type: string | symbol, handler: Function) {
    const handlers = this.handlers.get(type)
    if (handlers) {
      handlers.push(handler)
    } else {
      this.handlers.set(type, [handler])
    }
  }

  /**
   * Remove an event handler for the given type.
   * If `handler` is omitted, all handlers of the given type are removed.
   * @param {string|symbol} type Type of event to unregister `handler` from (`'*'` to remove a wildcard handler)
   * @param {Function} [handler] Handler function to remove
   * @memberOf mitt
   */
  off(type: string | symbol, handler?: Function) {
    const handlers = this.handlers.get(type)
    if (handlers) {
      if (handler) {
        handlers.splice(handlers.indexOf(handler) >>> 0, 1)
      } else {
        this.handlers.set(type, [])
      }

      if (!this.handlers.get(type).length) {
        this.handlers.delete(type)
      }
    }
  }

  /**
   * Invoke all handlers for the given type.
   * If present, `'*'` handlers are invoked after type-matched handlers.
   *
   * Note: Manually firing '*' handlers is not supported.
   *
   * @param {string|symbol} type The event type to invoke
   * @param {Any} [evt] Any value (object is recommended and powerful), passed to each handler
   * @memberOf mitt
   */
  emit(type: string | symbol, evt?: any) {
    let handlers = this.handlers.get(type) as Function[]
    if (handlers) {
      handlers.slice().forEach((handler) => {
        handler(evt)
      })
    }

    handlers = this.handlers.get('*')
    if (handlers) {
      handlers.slice().forEach((handler) => {
        handler(type, evt)
      })
    }
  }

  /**
   * Like `on` but the listener will only be fired once and then it will be removed.
   * @param type - the event you'd like to listen to
   * @param handler - the handler function to run when the event occurs
   * @returns `this` to enable you to chain method calls.
   */
  once(type: string | symbol, handler: Function) {
    const onceHandler = (eventData: any) => {
      handler(eventData)
      this.off(type, onceHandler)
    }

    return this.on(type, onceHandler)
  }

  /**
   * Gets the number of listeners for a given event.
   *
   * @param {string|symbol}type - the event to get the listener count for
   * @returns the number of listeners bound to the given event
   */
  listenerCount(type: string | symbol) {
    return this.handlers.get(type)?.length || 0
  }

  /**
   * Removes all listeners. If given an event argument, it will remove only
   * listeners for that event.
   *
   * @param {string|symbol} type - the event to remove listeners for.
   * @returns `this` to enable you to chain method calls.
   */
  removeAll(type?: string | symbol) {
    if (type === undefined || type === '*') {
      this.handlers.clear()
    } else {
      this.handlers.delete(type)
    }
    return this
  }
}

export default Event
