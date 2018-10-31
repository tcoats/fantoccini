// http://seenjs.io
// http://seenjs.io/docco/seen.html

const inject = require('injectinto')
inject('pod', () => {
  const ecs = inject.one('ecs')
  const seen = require('seen')

  let canvas = null
  let model = null
  let projection = null
  let viewport = null
  let scene = null
  let cameraOrientation = seen.M()
  let cameraPosition = seen.P(0, -5, 12)
  const shapes = {}

  const lookat = (target) => {
    const up = seen.P(0, 1, 0)
    const z = cameraPosition.copy().subtract(target).normalize()
    const x = up.cross(z).normalize()
    const y = z.copy().cross(x)
    cameraOrientation = seen.M()
    cameraOrientation.m[0] = x.x
    cameraOrientation.m[1] = y.x
    cameraOrientation.m[2] = z.x

    cameraOrientation.m[4] = x.y
    cameraOrientation.m[5] = y.y
    cameraOrientation.m[6] = z.y

    cameraOrientation.m[8] = x.z
    cameraOrientation.m[9] = y.z
    cameraOrientation.m[10] = z.z
  }
  lookat(seen.P(0, 0, 0))

  ecs.on('init', () => {
    canvas = document.getElementById('root')

    model = new seen.Model()
    model._id = ecs.id()
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

    projection = seen.Projections.perspectiveFov(60)

    zoom = 200
    viewport = {
      prescale: null,
      postscale: seen.M()
        .scale(zoom, -zoom, zoom)
        .translate(canvas.width / 2, canvas.height / 2, 0)
    }
    scene = new seen.Scene({
      model: model,
      viewport: viewport,
      camera: new seen.Camera({ projection: projection }),
      fractionalPoints: true
    })

    dragger = new seen.Drag('root')
    dragger.on('drag.rotate', (e) => {
      cameraOrientation.multiply(
        seen.Quaternion.xyToTransform(...e.offsetRelative))
    })
  })

  ecs.on('new sphere body', (id, body) => {
    const shape = seen.Shapes.sphere(1)
    shape._id = id
    shape.scale(1)
    shape.bake()
    model.add(shape)
    shapes[id] = { shape: shape, body: body }
  })

  ecs.on('delete', (id) => {
    if (shapes[id]) {
      model.remove(shapes[id].shape)
      delete shapes[id]
    }
  })

  ecs.on('display delta', (id, dt) => {
    const { x, y, z } = cameraPosition.copy().multiply(-1)
    viewport.prescale = cameraOrientation.copy().translate(x, y, z)
    for (let s of Object.values(shapes)) {
      s.shape.reset()
      const a = s.body.quaternion.toArray()
      s.shape.matrix(new seen.Quaternion(...a).toMatrix().m)
      const p = s.body.position
      s.shape.translate(p.x, p.y, p.z)
    }
  })

  ecs.on('start', () => {
    const context = seen.Context('root')
    context.sceneLayer(scene)
    const animator = context.animate()
    animator.onBefore((t, dt) => {
      ecs.emit('event delta', null, dt)
      ecs.emit('physics delta', null, dt)
      ecs.emit('display delta', null, dt)
    })
    animator.start()
  })
})
