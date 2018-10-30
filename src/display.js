const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const seen = require('seen')

  let canvas = null
  let shapes = []
  let model = null
  let modelId = null
  let projection = null
  let scene = null
  let context = null
  let animator = null

  ecs.on('init', () => {
    canvas = document.getElementById('root')

    modelId = ecs.id()
    model = new seen.Model()
    model.add(seen.Lights.directional({
      normal: seen.P(-1, 1, 1).normalize(),
      color: seen.Colors.hsl(0.1, 0.3, 0.7),
      intensity : 0.002
    }))
    model.add(seen.Lights.directional({
      normal: seen.P(1, 1, -1).normalize(),
      intensity: 0.001
    }))
    model.add(seen.Lights.ambient({
      intensity: 0.0015
    }))
    ecs.emit('display model available', modelId, model)

    projection = seen.Projections.perspective(-1, 1, -1, 1)

    scene = new seen.Scene({
      model: model,
      viewport: seen.Viewports.center(canvas.width, canvas.height),
      camera: new seen.Camera({ projection: projection }),
      fractionalPoints: true
    })
  })

  ecs.on('new sphere body', (id, body) => {
    const shape = seen.Shapes.sphere(2)
    shape.scale(canvas.height * 0.4)
    shape.bake()
    model.add(shape)
    shapes.push({
      id: id,
      shape: shape,
      body: body
    })
  })

  ecs.on('display delta', (id, dt) => {
    for (let shape of shapes) {
      shape.shape.reset()
      const a = shape.body.quaternion.toArray()
      shape.shape.matrix(new seen.Quaternion(...a).toMatrix().m)
      const p = shape.body.position
      shape.shape.translate(p.x, p.y, p.z)
    }
  })

  ecs.on('start', () => {
    context = seen.Context('root')
    context.sceneLayer(scene)

    animator = context.animate()
    animator.onBefore((t, dt) => {
      ecs.emit('event delta', null, dt)
      ecs.emit('physics delta', null, dt)
      ecs.emit('display delta', null, dt)
    })
    animator.start()
  })
})
