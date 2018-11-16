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

  let movementX = 0
  let movementY = 0
  const pressed = {}
  const keys = {
    forward: 87,
    backward: 83,
    left: 65,
    right: 68,
    up: 32,
    down: 16,
    menu: 192,
    xaxis: 90,
    yaxis: 88,
    zaxis: 67,
    physics: 80
  }
  for (let key of Object.values(keys)) pressed[key] = false

  let inmenu = true
  let menuopenedat = null
  ecs.on('menu open', () => {
    menuopenedat = Date.now()
    inmenu = true
  })
  ecs.on('menu close', () => {
    menuopenedat = null
    inmenu = false
  })

  let constraints = { x: false, y: false, z: false }
  let constrainedat = null
  let prevconstraints = null
  ecs.on('constrain axis', (id, c) => constraints = c)

  let physicsMode = 0
  ecs.on('physics mode', (id, p) => physicsMode = p)

  const onmove = (e) => {
    movementX += e.movementX
    movementY += e.movementY
  }
  const onkeydown = (e) => {
    if (pressed[e.keyCode]) return
    pressed[e.keyCode] = true
    switch (e.keyCode) {
    case keys.menu:
      if (inmenu) ecs.emit('menu close')
      else ecs.emit('menu open')
      break
    case keys.physics:
      physicsMode += 1
      physicsMode %= 3
      ecs.emit('physics mode', null, physicsMode)
      break
    case keys.xaxis:
    case keys.yaxis:
    case keys.zaxis:
      if (!constrainedat) {
        constrainedat = Date.now()
        prevconstraints = constraints
      }
      ecs.emit('constrain axis', null, {
        x: !pressed[keys.xaxis],
        y: !pressed[keys.yaxis],
        z: !pressed[keys.zaxis]
      })
      break
    }
  }
  const onkeyup = (e) => {
    switch (e.keyCode) {
    case keys.menu:
      if (inmenu && Date.now() - menuopenedat > 200) ecs.emit('menu close')
      break
    case keys.xaxis:
      if (!constrainedat || Date.now() - constrainedat < 200) {
        ecs.emit('constrain axis', null, {
          x: !prevconstraints.x,
          y: prevconstraints.y,
          z: prevconstraints.z
        })
        prevconstraints = constraints
        constrainedat = null
      } else if (!pressed[keys.yaxis] && !pressed[keys.zaxis]) {
        ecs.emit('constrain axis', null, prevconstraints)
        constrainedat = null
      } else  ecs.emit('constrain axis', null, {
        x: true,
        y: constraints.y,
        z: constraints.z
      })
      break
    case keys.yaxis:
      if (!constrainedat || Date.now() - constrainedat < 200) {
        ecs.emit('constrain axis', null, {
          x: prevconstraints.x,
          y: !prevconstraints.y,
          z: prevconstraints.z
        })
        prevconstraints = constraints
        constrainedat = null
      } else if (!pressed[keys.xaxis] && !pressed[keys.zaxis]) {
        ecs.emit('constrain axis', null, prevconstraints)
        constrainedat = null
      } else  ecs.emit('constrain axis', null, {
        x: constraints.x,
        y: true,
        z: constraints.z
      })
      break
    case keys.zaxis:
      if (!constrainedat || Date.now() - constrainedat < 200) {
        ecs.emit('constrain axis', null, {
          x: prevconstraints.x,
          y: prevconstraints.y,
          z: !prevconstraints.z
        })
        prevconstraints = constraints
        constrainedat = null
      } else if (!pressed[keys.xaxis] && !pressed[keys.yaxis]) {
        ecs.emit('constrain axis', null, prevconstraints)
        constrainedat = null
      } else ecs.emit('constrain axis', null, {
        x: constraints.x,
        y: constraints.y,
        z: true
      })
      break
    }
    pressed[e.keyCode] = false
  }

  let mouseIsDown = false
  let mouseDownAt = null
  let dragStartPosition = new three.Vector3()
  let dragStartQuaternion = new three.Quaternion()
  const calcDrag = () => {
    const position = new three.Vector3()
    const quaternion = new three.Quaternion()
    worldcamera.getWorldPosition(position)
    worldcamera.getWorldQuaternion(quaternion)
    const deltaPosition = position.clone().sub(dragStartPosition)
    const deltaQuaternion = dragStartQuaternion.clone().inverse().multiply(quaternion)
    return {
      startPosition: dragStartPosition,
      startQuaternion: dragStartQuaternion,
      deltaPosition: deltaPosition,
      deltaQuaternion: deltaQuaternion,
      position: position,
      quaternion: quaternion
    }
  }
  ecs.on('init', () => {
    root.addEventListener('click', (e) => {
      if (!islocked) return root.requestPointerLock()
    })
    root.addEventListener('mousedown', (e) => {
      if (!islocked) return
      mouseIsDown = true
      mouseDownAt = Date.now()
      worldcamera.getWorldPosition(dragStartPosition)
      worldcamera.getWorldQuaternion(dragStartQuaternion)
    })
    root.addEventListener('mousemove', (e) => {
      if (!islocked || !mouseIsDown) return
      const drag = calcDrag()
      if (mouseDownAt && (Date.now() - mouseDownAt > 200 || drag.deltaPosition.lengthSq() > 0.1 || drag.deltaQuaternion.lengthSq() > 0.1))
        mouseDownAt = null
    })
    root.addEventListener('mouseup', (e) => {
      if (!islocked) return
      mouseIsDown = false
      if (mouseDownAt && Date.now() - mouseDownAt < 200) {
        mouseDownAt = null
        ecs.emit('pointer click')
        return
      }
      const drag = calcDrag()
      ecs.emit('dragging finished', null, drag)
    })
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === root) ecs.emit('pointer captured')
      else ecs.emit('pointer released')
    })
  })

  ecs.on('pointer captured', () => {
    islocked = true
    document.addEventListener('mousemove', onmove)
    document.addEventListener('keydown', onkeydown)
    document.addEventListener('keyup', onkeyup)
  })

  ecs.on('pointer released', () => {
    islocked = false
    document.removeEventListener('mousemove', onmove)
    document.removeEventListener('keydown', onkeydown)
    document.removeEventListener('keyup', onkeyup)
  })

  ecs.on('load world camera', (id, c) => worldcamera = c)
  ecs.on('load camera', (id, p) => camera = p)

  const impulse = new three.Vector3()
  ecs.on('event delta', (id, dt) => {
    if (!camera) return
    const mouseSensitivity = 0.002
    camera.body.rotation.y -= movementX * mouseSensitivity
    camera.head.rotation.x -= movementY * mouseSensitivity
    camera.head.rotation.x = Math.min(Math.PI / 2, camera.head.rotation.x)
    camera.head.rotation.x = Math.max(-Math.PI / 2, camera.head.rotation.x)
    impulse.set(
      Number(pressed[keys.right]) - Number(pressed[keys.left]),
      Number(pressed[keys.up]) - Number(pressed[keys.down]),
      Number(pressed[keys.backward]) - Number(pressed[keys.forward]))
    impulse.multiplyScalar(0.01 * dt)
    impulse.applyQuaternion(camera.head.quaternion)
    impulse.applyQuaternion(camera.body.quaternion)
    camera.body.position.add(impulse)
    movementX = 0
    movementY = 0
    if (mouseIsDown) {
      if (mouseDownAt && (Date.now() - mouseDownAt > 200)) mouseDownAt = null
      if (!mouseDownAt) ecs.emit('dragging', null, calcDrag())
    }
  })
})
