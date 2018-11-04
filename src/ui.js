import classes from './index.styl'
const inject = require('injectinto')
const three = require('three')

const patch = require('snabbdom').init([
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/attributes').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/eventlisteners').default,
])
const canvas = document.getElementById('canvas')
let current = document.querySelector('#root')
const update = (next) => {
  patch(current, next)
  current = next
}

inject('pod', () => {
  const ecs = inject.one('ecs')
  let frame = 0

  let worldcamera  = null
  ecs.on('load world camera', (id, c) => worldcamera = c)
  const zero = new three.Vector3(0, 0, 0)
  const origin = new three.Vector3()

  const h = require('snabbdom/h').default
  const ui = (state, params, ecs) => {
    const elements = []

    elements.push([zero, h('div.test', '(0, 0, 0')])

    return h('div#root', elements.map(e => {
      origin.copy(e[0])
      origin.project(worldcamera)
      const x = (origin.x + 1.0) * (canvas.width / 2.0)
      const y = (1.0 - origin.y) * (canvas.height / 2.0)
      if (isNaN(x) || isNaN(y)) return null
      return h('span', { style: { position: 'absolute', left: `${x}px`, top: `${y}px` } }, e[1])
    }))
  }

  let state = {}
  let params = {}
  ecs.on('display delta', (id, dt) => {
    frame++
    update(ui(state, params, ecs))
  })
})
