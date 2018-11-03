const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const THREE = require('three')
  const CANNON = require('cannon')
  const canvas = document.getElementById('root')

  let player = null

  let movementX = 0
  let movementY = 0
  let canJump = false
  const pressed = {}
  const keys = {
    forward: 87,
    backward: 83,
    left: 65,
    right: 68,
    up: 81,
    down: 69,
    jump: 32
  }
  for (let key of Object.values(keys)) pressed[key] = false

  const onmove = (e) => {
    movementX += e.movementX
    movementY += e.movementY
  }
  const onkeydown = (e) => pressed[e.keyCode] = true
  const onkeyup = (e) => pressed[e.keyCode] = false

  ecs.on('init', () => {
    canvas.onclick = (e) => canvas.requestPointerLock()
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === canvas) ecs.emit('pointer captured')
      else ecs.emit('pointer released')
    })
  })

  ecs.on('pointer captured', () => {
    document.addEventListener('mousemove', onmove)
    document.addEventListener('keydown', onkeydown)
    document.addEventListener('keyup', onkeyup)
  })

  ecs.on('pointer released', () => {
    document.removeEventListener('mousemove', onmove)
    document.removeEventListener('keydown', onkeydown)
    document.removeEventListener('keyup', onkeyup)
  })

  ecs.on('load player', (id, p) => {
    player = p
    player.physics.addEventListener('collide', (e) => {
      let contactNormal = new CANNON.Vec3()
      if (e.contact.bi.id == player.physics.id) e.contact.ni.negate(contactNormal)
      else contactNormal.copy(e.contact.ni)
      // todo = better jumping logic
      if (contactNormal.dot(new CANNON.Vec3(0,1,0)) > 0.5) canJump = true
    })
  })

  let frame = 0
  ecs.on('event delta', (id, dt) => {
    frame++
    if (!player) return
    const mouseSensitivity = 0.002
    player.body.rotation.y -= movementX * mouseSensitivity
    player.head.rotation.x -= movementY * mouseSensitivity
    player.head.rotation.x = Math.min(Math.PI / 2, player.head.rotation.x)
    player.head.rotation.x = Math.max(-Math.PI / 2, player.head.rotation.x)
    const lookDirection = new THREE.Quaternion()
    lookDirection.setFromEuler(
      new THREE.Euler(0, player.body.rotation.y, 0, 'XYZ'))
    const impulse = new THREE.Vector3(
      Number(pressed[keys.right]) - Number(pressed[keys.left]),
      Number(pressed[keys.up]) - Number(pressed[keys.down]),
      Number(pressed[keys.backward]) - Number(pressed[keys.forward]))
    if (frame % 60 == 0) {}
    impulse.multiplyScalar(0.02 * dt)
    if (pressed[keys.jump] && canJump) {
      impulse.y = 20
      canJump = false
    }
    impulse.applyQuaternion(lookDirection)
    player.physics.velocity.x += impulse.x
    player.physics.velocity.y += impulse.y
    player.physics.velocity.z += impulse.z
    player.body.position.copy(player.physics.position)
    movementX = 0
    movementY = 0
  })
})
