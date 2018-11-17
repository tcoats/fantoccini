const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  let islocked = false

  ecs.on('pointer captured', () => {
    islocked = true
  })
  ecs.on('pointer released', () => {
    islocked = false
  })
  ecs.on('init', () => {
    root.addEventListener('click', (e) => {
      if (!islocked) root.requestPointerLock()
    })
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === root) {
        ecs.emit('pointer captured')
        ecs.emit('drag enabled')
        ecs.emit('controls enabled')
        ecs.emit('hotkeys enabled')
        ecs.emit('constraints enabled')
      }
      else {
        ecs.emit('pointer released')
        ecs.emit('drag disabled')
        ecs.emit('controls disabled')
        ecs.emit('hotkeys disabled')
        ecs.emit('constraints disabled')
      }
    })
  })
})