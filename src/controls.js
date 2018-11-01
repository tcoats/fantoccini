const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const seen = require('seen')

  let cameraOrientation = null
  let cameraPosition = null

  let movementX = 0
  let movementY = 0
  const pressed={}

  const forwardkey = 87
  const backwardkey = 83
  const leftkey = 65
  const rightkey = 68
  const upkey = 81
  const downkey = 69

  const onmove = (e) => {
    movementX += e.movementX
    movementY += e.movementY
  }
  const onkeydown = (e) => pressed[e.keyCode] = true
  const onkeyup = (e) => delete pressed[e.keyCode]

  ecs.on('init', () => {
    canvas = document.getElementById('root')
    canvas.onclick = (e) => canvas.requestPointerLock()
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === canvas) ecs.emit('pointer captured')
      else ecs.emit('pointer released')
    })
  })

  ecs.on('camera orientation', (id, orientation) =>
    cameraOrientation = orientation)

  ecs.on('camera position', (id, position) =>
    cameraPosition = position)

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

  const cameraSpeed = 0.02
  let frame = 0

  ecs.on('display delta', (id, dt) => {
    frame++
    if (cameraOrientation && cameraPosition) {
      cameraOrientation
        .multiply(seen.Quaternion.pointAngle(seen.Points.Y(), movementX / 150))
        .multiply(seen.Quaternion.pointAngle(seen.Points.X(), movementY / 150))

      const z = (pressed[leftkey] ? 1.0 : 0.0)
        - (pressed[rightkey] ? 1.0 : 0.0)
      const y = (pressed[forwardkey] ? 1.0 : 0.0)
        - (pressed[backwardkey] ? 1.0 : 0.0)
      const x = (pressed[upkey] ? 1.0 : 0.0)
        - (pressed[downkey] ? 1.0 : 0.0)

      cameraPosition.subtract(seen.P(1, 0, 0)
          .transform(cameraOrientation.toMatrix())
          .multiply(x * dt * cameraSpeed))
      cameraPosition.subtract(seen.P(0, 1, 0)
          .transform(cameraOrientation.toMatrix())
          .multiply(y * dt * cameraSpeed))
      cameraPosition.subtract(seen.P(0, 0, 1)
          .transform(cameraOrientation.toMatrix())
          .multiply(z * dt * cameraSpeed))
    }

    movementX = 0
    movementY = 0
  })
})
