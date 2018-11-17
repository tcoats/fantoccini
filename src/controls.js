const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const three = require('three')
  const cannon = require('cannon')
  const canvas = document.getElementById('canvas')
  const root = document.getElementById('root')

  let camera = null
  let worldcamera = null
  let islocked = false

  let mouseDeltaX = 0
  let mouseDeltaY = 0
  let mouseIsDown = false
  let mouseDownAt = null
  let dragStartPosition = new three.Vector3()
  let dragStartQuaternion = new three.Quaternion()
  const pressed = {}
  const keys = {
    forward: 87,
    backward: 83,
    left: 65,
    right: 68,
    up: 32,
    down: 16,
    menu: 192,
    physics: 80
  }
  for (let key of Object.values(keys)) pressed[key] = false

  let menuOpen = true
  let menuOpenedAt = null
  let physicsMode = 0

  const dragPosition = new three.Vector3()
  const dragQuaternion = new three.Quaternion()
  const dragDeltaPosition = new three.Vector3()
  const dragDeltaQuaternion = new three.Quaternion()
  const dragCalc = () => {
    worldcamera.getWorldPosition(dragPosition)
    worldcamera.getWorldQuaternion(dragQuaternion)
    dragDeltaPosition.copy(dragPosition).sub(dragStartPosition)
    dragDeltaQuaternion.copy(dragStartQuaternion).inverse().multiply(dragQuaternion)
    return {
      startPosition: dragStartPosition,
      startQuaternion: dragStartQuaternion,
      deltaPosition: dragDeltaPosition,
      deltaQuaternion: dragDeltaQuaternion,
      position: dragPosition,
      quaternion: dragQuaternion
    }
  }
  const onmousedown = (e) => {
    if (!islocked) return
    mouseIsDown = true
    mouseDownAt = Date.now()
    worldcamera.getWorldPosition(dragStartPosition)
    worldcamera.getWorldQuaternion(dragStartQuaternion)
  }
  const onmouseup = (e) => {
    if (!islocked) return
    mouseIsDown = false
    if (mouseDownAt && Date.now() - mouseDownAt < 200) {
      mouseDownAt = null
      ecs.emit('pointer click')
      return
    }
    const drag = dragCalc()
    ecs.emit('dragging finished', null, drag)
  }
  const onmove = (e) => {
    mouseDeltaX += e.movementX
    mouseDeltaY += e.movementY
    if (!mouseIsDown) return
    const drag = dragCalc()
    if (mouseDownAt && (Date.now() - mouseDownAt > 200 || drag.deltaPosition.lengthSq() > 0.1 || drag.deltaQuaternion.lengthSq() > 0.1))
      mouseDownAt = null
  }
  const onphysicsdown = () => {
    physicsMode += 1
    physicsMode %= 3
    ecs.emit('physics mode', null, physicsMode)
  }
  const onmenudown = () => {
    if (menuOpen) ecs.emit('menu close')
    else ecs.emit('menu open')
  }
  const onmenuup = () => {
    if (menuOpen && Date.now() - menuOpenedAt > 200)
      ecs.emit('menu close')
  }
  const onkeydown = (e) => {
    if (pressed[e.keyCode]) return
    pressed[e.keyCode] = true
    switch (e.keyCode) {
      case keys.menu: onmenudown(); break;
      case keys.physics: onphysicsdown(); break;
    }
  }
  const onkeyup = (e) => {
    switch (e.keyCode) {
      case keys.menu: onmenuup(); break;
    }
    pressed[e.keyCode] = false
  }

  ecs.on('menu open', () => {
    menuOpenedAt = Date.now()
    menuOpen = true
  })
  ecs.on('menu close', () => {
    menuOpenedAt = null
    menuOpen = false
  })
  ecs.on('physics mode', (id, p) => physicsMode = p)
  ecs.on('load world camera', (id, c) => worldcamera = c)
  ecs.on('load camera', (id, p) => camera = p)
  ecs.on('pointer captured', () => {
    islocked = true
    document.addEventListener('mousedown', onmousedown)
    document.addEventListener('mouseup', onmouseup)
    document.addEventListener('mousemove', onmove)
    document.addEventListener('keydown', onkeydown)
    document.addEventListener('keyup', onkeyup)
  })
  ecs.on('pointer released', () => {
    islocked = false
    document.removeEventListener('mousedown', onmousedown)
    document.removeEventListener('mouseup', onmouseup)
    document.removeEventListener('mousemove', onmove)
    document.removeEventListener('keydown', onkeydown)
    document.removeEventListener('keyup', onkeyup)
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

  const impulse = new three.Vector3()
  ecs.on('event delta', (id, dt) => {
    if (!camera) return
    const mouseSensitivity = 0.002
    camera.body.rotation.y -= mouseDeltaX * mouseSensitivity
    camera.head.rotation.x -= mouseDeltaY * mouseSensitivity
    camera.head.rotation.x = Math.min(
      Math.PI / 2, camera.head.rotation.x)
    camera.head.rotation.x = Math.max(
      -Math.PI / 2, camera.head.rotation.x)
    impulse.set(
      Number(pressed[keys.right]) - Number(pressed[keys.left]),
      Number(pressed[keys.up]) - Number(pressed[keys.down]),
      Number(pressed[keys.backward]) - Number(pressed[keys.forward]))
    impulse.multiplyScalar(0.01 * dt)
    impulse.applyQuaternion(camera.head.quaternion)
    impulse.applyQuaternion(camera.body.quaternion)
    camera.body.position.add(impulse)
    mouseDeltaX = 0
    mouseDeltaY = 0
    if (mouseIsDown) {
      if (mouseDownAt && (Date.now() - mouseDownAt > 200))
        mouseDownAt = null
      if (!mouseDownAt) ecs.emit('dragging', null, dragCalc())
    }
  })
})
