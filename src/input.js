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
    }
    if (e.key.length == 1) input += e.key
    if (e.key == 'Backspace') input = input.slice(0, -1)
    ecs.emit('input updated', null, input)
  }
  const onkeyup = (e) => {
    if (e.keyCode == keys.cancel) {
      ecs.emit('input disabled')
    }
  }

  ecs.on('input enabled', () => {
    ecs.emit('drag disabled')
    ecs.emit('controls disabled')
    ecs.emit('hotkeys disabled')
    ecs.emit('constraints disabled')
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
    document.removeEventListener('keydown', onkeydown)
    document.removeEventListener('keyup', onkeyup)
  })
})