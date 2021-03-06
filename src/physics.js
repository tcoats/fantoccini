// http://schteppe.github.io/cannon.js/
// http://schteppe.github.io/cannon.js/docs/

const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const cannon = require('cannon')

  let world = null
  let entities = {}

  ecs.on('init', () => {
    world = new cannon.World()
    world.quatNormalizeSkip = 0
    world.quatNormalizeFast = false
    const solver = new cannon.GSSolver()
    world.defaultContactMaterial.contactEquationStiffness = 1e9
    world.defaultContactMaterial.contactEquationRelaxation = 4
    solver.iterations = 7
    solver.tolerance = 0.1
    world.solver = new cannon.SplitSolver(solver)
    world.gravity.set(0, -9.8, 0)
    world.broadphase = new cannon.NaiveBroadphase()

    const physicsMaterial = new cannon.Material('slipperyMaterial')
    world.addContactMaterial(
      new cannon.ContactMaterial(physicsMaterial, physicsMaterial, 0.0, 0.3))
  })

  const setDamping = (body, damping) => {
    body.linearDamping = damping
    body.angularDamping = damping
  }

  let physicsMode = 0
  const physics = { on: 0, molasses: 1, off: 2 }
  ecs.on('physics mode', (id, p) => {
    physicsMode = p
    switch (p) {
    case physics.on:
      world.gravity.set(0, -9.8, 0)
      for (let entity of Object.values(entities))
        setDamping(entity.body, 0)
      break
    case physics.molasses:
      world.gravity.set(0, 0, 0)
      for (let entity of Object.values(entities))
        setDamping(entity.body, 0.5)
      break
    }
  })

  ecs.on('load ground', (id, ground) => {
    ground.shape = new cannon.Plane()
    ground.body = new cannon.Body({ mass: 0 })
    ground.body.addShape(ground.shape)
    ground.body.quaternion.setFromAxisAngle(
      new cannon.Vec3(1, 0, 0), -Math.PI / 2)
    world.addBody(ground.body)
  })

  ecs.on('load box', (id, box) => {
    const halfExtents = box.halfExtents
      ? box.halfExtents : new cannon.Vec3(1, 1, 1)
    box.shape = new cannon.Box(halfExtents)
    box.body = new cannon.Body({ mass: 5 })
    box.body.addShape(box.shape)
    box.body.position.copy(box.position)
    switch (physicsMode) {
      case physics.on: setDamping(box.body, 0); break;
      case physics.molasses: setDamping(box.body, 0.5); break;
    }
    world.addBody(box.body)
    entities[id] = box
  })

  ecs.on('delete', (id) => {
    if (entities[id]) {
      if (entities[id].body) world.removeBody(entities[id].body)
      delete entities[id]
    }
  })

  ecs.on('physics delta', (id, dt) => {
    if (physicsMode != 2) world.step(1.0 / 60.0, dt / 1000, 3)
  })

  ecs.on('physics to display delta', (id, dt) => {
    for (let shape of Object.values(entities)) {
      shape.mesh.position.copy(shape.body.position)
      shape.mesh.quaternion.copy(shape.body.quaternion)
    }
  })
})
