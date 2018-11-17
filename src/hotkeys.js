const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const keys = {
    menu: 192,
    physics: 80
  }
  let menuDown = false
  let menuOpen = true
  let menuOpenedAt = null
  let physicsDown = false
  let physicsMode = 0

  const onkeydown = (e) => {
    switch (e.keyCode) {
      case keys.menu:
        if (menuDown) return
        menuDown = true
        if (menuOpen) ecs.emit('menu close')
        else ecs.emit('menu open')
        break
      case keys.physics:
        if (physicsDown) return
        physicsDown = true
        physicsMode += 1
        physicsMode %= 3
        ecs.emit('physics mode', null, physicsMode)
        break
    }
  }
  const onkeyup = (e) => {
    switch (e.keyCode) {
      case keys.menu:
        menuDown = false
        if (menuOpen && Date.now() - menuOpenedAt > 200)
          ecs.emit('menu close')
        break
      case keys.physics:
        physicsDown = false
        break
    }
  }

  ecs.on('physics mode', (id, p) => physicsMode = p)
  ecs.on('menu open', () => {
    menuOpenedAt = Date.now()
    menuOpen = true
  })
  ecs.on('menu close', () => {
    menuOpenedAt = null
    menuOpen = false
  })
  ecs.on('pointer captured', () => {
    document.addEventListener('keydown', onkeydown)
    document.addEventListener('keyup', onkeyup)
  })
  ecs.on('pointer released', () => {
    document.removeEventListener('keydown', onkeydown)
    document.removeEventListener('keyup', onkeyup)
  })
})
