module.exports = () => {
  const free = []
  let counter = 0
  const listeners = {
    'delete': [
      (id) => {
        free.push(id)
        res.emit('deleted', id)
      }
    ]
  }
  const res = {
    id: () => {
      if (free.length > 0) return free.pop()
      counter++
      return counter
    },
    on: (e, fn) => {
      if (!listeners[e]) listeners[e] = []
      listeners[e].push(fn)
    },
    emit: (e, id, ...args) => {
      if (!listeners[e]) return
      for (let listener of listeners[e])
        listener(id, ...args)
    },
    emitAsync: (e, id, ...args) =>
      Promise.all(!listeners[e] ? [] :
        listeners[e].map((listener) => listener(id, ...args))),
    call: (e, id, ...args) => {
      if (!listeners[e]) return
      for (let listener of listeners[e])
        return listener(id, ...args)
    }
  }
  return res
}
