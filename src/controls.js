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
  const pressed = {}
  const keys = {
    forward: 87,
    backward: 83,
    left: 65,
    right: 68,
    up: 32,
    down: 16
  }
  for (let key of Object.values(keys)) pressed[key] = false

  const onmove = (e) => {
    mouseDeltaX += e.movementX
    mouseDeltaY += e.movementY
  }
  const onkeydown = (e) => {
    if (pressed[e.keyCode]) return
    pressed[e.keyCode] = true
  }
  const onkeyup = (e) => {
    pressed[e.keyCode] = false
  }

  ecs.on('load world camera', (id, c) => worldcamera = c)
  ecs.on('load camera', (id, p) => camera = p)
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
  })
})
