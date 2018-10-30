const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const cannon = require('cannon')

  let world = null
  let groundBody = null
  let groundShape = null

  const bodies = {}

  ecs.on('init', () => {
    world = new cannon.World()
    world.defaultContactMaterial.contactEquationStiffness = 1e6
    world.defaultContactMaterial.contactEquationRegularizationTime = 3
    world.solver.iterations = 20
    world.gravity.set(0, 0, -9.82)
    world.allowSleep = true
    world.broadphase = new cannon.SAPBroadphase(world)
  })

  ecs.on('load', () => {
    groundBody = new cannon.Body({ mass: 0 })
    groundShape = new cannon.Plane()
    groundBody.addShape(groundShape)
    world.addBody(groundBody)
  })

  ecs.on('create sphere', (id) => {
    const sphereBody = new cannon.Body({
      mass: 5,
      friction: 0.1,
      restitution: 0.3,
      sleepSpeedLimit: 0.01,
      sleepTimeLimit: 1.0,
      position: new cannon.Vec3(0, 0, 10),
      angularVelocity: new cannon.Vec3(0, 0, 1),
      shape: new cannon.Sphere(1)
    })
    world.addBody(sphereBody)
    sphereBody._id = id
    bodies[id] = sphereBody
    ecs.emit('new sphere body', sphereBody._id, sphereBody)
  })

  ecs.on('delete', (id) => {
    if (bodies[id]) {
      world.removeBody(bodies[id])
      delete bodies[id]
    }
  })

  ecs.on('physics delta', (id, dt) => {
    world.step(1.0 / 60.0, dt / 1000, 3)
  })
})
