import classes from './index.styl'
const inject = require('injectinto')

inject('pod', () => {
  const ecs = inject.one('ecs')
  const three = require('three')
  const patch = require('snabbdom').init([
    require('snabbdom/modules/class').default,
    require('snabbdom/modules/props').default,
    require('snabbdom/modules/attributes').default,
    require('snabbdom/modules/style').default,
    require('snabbdom/modules/eventlisteners').default,
  ])
  const canvas = document.getElementById('canvas')
  let frame = 0

  let worldcamera  = null
  ecs.on('load world camera', (id, c) => worldcamera = c)
  let spotlight = null
  ecs.on('spotlight clear', () => spotlight = null)
  ecs.on('spotlight set', (id, entity) => spotlight = entity)

  let inmenu = true
  ecs.on('menu open', () => inmenu = true)
  ecs.on('menu close', () => inmenu = false)

  let constraints = { x: false, y: false, z: false }
  ecs.on('constrain axis', (id, c) => constraints = c)

  let physicsModes = ['running', 'molasses', 'disabled']
  let physicsMode = 0
  ecs.on('physics mode', (id, p) => physicsMode = p)

  const h = require('snabbdom/h').default
  const TEMP = new three.Vector3()
  const ui = (state, params, ecs) => {
    const elements = []

    if (inmenu) {
      if (spotlight) elements.push([spotlight.mesh.position, h('div.test', `[${spotlight.mesh.position.x.toFixed(2)}, ${spotlight.mesh.position.y.toFixed(2)}, ${spotlight.mesh.position.z.toFixed(2)}]`)])
    }

    return h('div#root', [
      h('div.constraints', [
        constraints.x ? 'x' : '',
        h('br'),
        constraints.y ? 'y' : '',
        h('br'),
        constraints.z ? 'z' : ''
      ]),
      h('div.crosshair'),
      inmenu ? h('div.physicsmode', `Physics: ${physicsModes[physicsMode]}`) : null,
      ...elements.map(e => {
        TEMP.copy(e[0])
        TEMP.project(worldcamera)
        const x = (TEMP.x + 1.0) * (canvas.width / 2.0)
        const y = (1.0 - TEMP.y) * (canvas.height / 2.0)
        if (isNaN(x) || isNaN(y)) return null
        return h('span.hud', { style: { position: 'absolute', left: `${x.toFixed(1)}px`, top: `${y.toFixed(1)}px` } }, e[1])
      })
    ])
  }

  let state = {}
  let params = {}
  let current = document.querySelector('#root')
  ecs.on('display delta', (id, dt) => {
    frame++
    const next = ui(state, params, ecs)
    patch(current, next)
    current = next
  })
})
