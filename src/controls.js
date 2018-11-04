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
    down: 16
  }
  for (let key of Object.values(keys)) pressed[key] = false

  const onmove = (e) => {
    movementX += e.movementX
    movementY += e.movementY
  }
  const onkeydown = (e) => pressed[e.keyCode] = true
  const onkeyup = (e) => pressed[e.keyCode] = false
  const client2D = new three.Vector2()
  const client3D = new three.Vector3()
  const onclick = (e) => {
    client2D.set(e.clientX, e.clientY)
    client3D.set(
      (e.clientX / canvas.width) * 2 - 1,
      -(e.clientY / canvas.height) * 2 + 1,
      0)
    client3D.unproject(worldcamera)
    ecs.emit('pointer click', null, {
      client2D: client2D,
      client3D: client3D
    })
  }

  ecs.on('init', () => {
    root.addEventListener('click', (e) => {
      if (!islocked) root.requestPointerLock()
      else onclick(e)
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

  let frame = 0
  const impulse = new three.Vector3()
  ecs.on('event delta', (id, dt) => {
    frame++
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
    if (frame % 60 == 0) {}
    impulse.multiplyScalar(0.01 * dt)
    impulse.applyQuaternion(camera.head.quaternion)
    impulse.applyQuaternion(camera.body.quaternion)
    camera.body.position.add(impulse)
    movementX = 0
    movementY = 0
  })
})
