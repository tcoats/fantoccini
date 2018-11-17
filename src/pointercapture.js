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
      if (document.pointerLockElement === root)
        ecs.emit('pointer captured')
      else ecs.emit('pointer released')
    })
  })
})