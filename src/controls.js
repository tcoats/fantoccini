const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const three = require('three')
  const cannon = require('cannon')
  const canvas = document.getElementById('canvas')
  const root = document.getElementById('root')

  let camera = null
  let worldcamera = null

  let mouseDeltaX = 0
  let mouseDeltaY = 0
  const keys = {
    forward: 87,
    backward: 83,
    left: 65,
    right: 68,
    up: 32,
    down: 16
  }
  let pressedforward = false
  let pressedbackward = false
  let pressedleft = false
  let pressedright = false
  let pressedup = false
  let presseddown = false

  const onmove = (e) => {
    mouseDeltaX += e.movementX
    mouseDeltaY += e.movementY
  }
  const onkeydown = (e) => {
    switch (e.keyCode) {
      case keys.forward: pressedforward = true; break;
      case keys.backward: pressedbackward = true; break;
      case keys.left: pressedleft = true; break;
      case keys.right: pressedright = true; break;
      case keys.up: pressedup = true; break;
      case keys.down: presseddown = true; break;
    }
  }
  const onkeyup = (e) => {
    switch (e.keyCode) {
      case keys.forward: pressedforward = false; break;
      case keys.backward: pressedbackward = false; break;
      case keys.left: pressedleft = false; break;
      case keys.right: pressedright = false; break;
      case keys.up: pressedup = false; break;
      case keys.down: presseddown = false; break;
    }
  }

  ecs.on('load world camera', (id, c) => worldcamera = c)
  ecs.on('load camera', (id, p) => camera = p)
  ecs.on('controls enabled', () => {
    document.addEventListener('mousemove', onmove)
    document.addEventListener('keydown', onkeydown)
    document.addEventListener('keyup', onkeyup)
  })
  ecs.on('controls disabled', () => {
    document.removeEventListener('mousemove', onmove)
    document.removeEventListener('keydown', onkeydown)
    document.removeEventListener('keyup', onkeyup)
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
      Number(pressedright) - Number(pressedleft),
      Number(pressedup) - Number(presseddown),
      Number(pressedbackward) - Number(pressedforward))
    impulse.multiplyScalar(0.01 * dt)
    impulse.applyQuaternion(camera.head.quaternion)
    impulse.applyQuaternion(camera.body.quaternion)
    camera.body.position.add(impulse)
    mouseDeltaX = 0
    mouseDeltaY = 0
  })
})
