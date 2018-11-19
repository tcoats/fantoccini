const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')

  const keys = {
    cancel: 192
  }
  let input = ''

  const onkeydown = (e) => {
    if (e.key == 'Enter') {
      ecs.emit('input disabled')
      ecs.emit('input submitted', null, input)
      return
    }
    if (e.key.length == 1)
      ecs.emit('input updated', null, input + e.key)
    else if (e.key == 'Backspace')
      ecs.emit('input updated', null, input.slice(0, -1))
  }
  const onkeyup = (e) => {
    if (e.keyCode == keys.cancel) {
      ecs.emit('input disabled')
    }
  }

  ecs.on('input updated', (id, s) => input = s)

  ecs.on('input enabled', () => {
    ecs.emit('drag disabled')
    ecs.emit('controls disabled')
    ecs.emit('hotkeys disabled')
    ecs.emit('constraints disabled')
    ecs.emit('tools disabled')
    document.addEventListener('keydown', onkeydown)
    document.addEventListener('keyup', onkeyup)
    input = ''
  })

  ecs.on('pointer released', () => {
    document.removeEventListener('keydown', onkeydown)
    document.removeEventListener('keyup', onkeyup)
    input = ''
  })

  ecs.on('input disabled', () => {
    ecs.emit('drag enabled')
    ecs.emit('controls enabled')
    ecs.emit('hotkeys enabled')
    ecs.emit('constraints enabled')
    ecs.emit('tools enabled')
    document.removeEventListener('keydown', onkeydown)
    document.removeEventListener('keyup', onkeyup)
  })
})