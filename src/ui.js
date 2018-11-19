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

  let menuopen = false
  ecs.on('menu open', () => menuopen = true)
  ecs.on('menu close', () => menuopen = false)

  let constraints = { x: false, y: false, z: false }
  ecs.on('constrain axis', (id, c) => constraints = c)

  let physicsModes = ['Physics On', 'Molasses', 'Physics Off']
  let physicsMode = 0
  ecs.on('physics mode', (id, p) => physicsMode = p)

  let menu = null
  let menuState = null
  ecs.on('tools menu', (id, m) => menu = m)
  ecs.on('tool select', (id, s) => menuState = s)

  const h = require('snabbdom/h').default
  const TEMP = new three.Vector3()
  const ui = (state, params, ecs) => {
    const elements = []

    if (menuopen) {
      if (spotlight) elements.push([spotlight.mesh.position, h('div.test', `[${spotlight.mesh.position.x.toFixed(2)}, ${spotlight.mesh.position.y.toFixed(2)}, ${spotlight.mesh.position.z.toFixed(2)}]`)])
    }

    return h('div#root', [
      h('div.constraints', [
        constraints.x ? h('div', 'X -') : h('div', 'X'),
        constraints.y ? h('div', 'Y -') : h('div', 'Y'),
        constraints.z ? h('div', 'Z -') : h('div', 'Z')
      ]),
      h('div.crosshair'),
      ...(menuopen ? [
        h('div.box.physicsmode', [
          physicsModes[physicsMode],
          h('span.shortcut', 'P')
        ]),
        h('div.menu', menu.map((tools, menuIndex) =>
          h('div.tools', tools.map((tool, toolIndex) =>
            h('div.box.tool', { class: { selected: (menuState && (menuState.current == tool || (menuIndex == menuState.menuIndex && toolIndex == menuState.toolIndex))) } }, [
              tool,
              toolIndex == 0
              ? h('span.shortcut', (menuIndex + 1).toString())
              : null
            ])))))
      ] : []),
      (!menuopen && menuState != null && menuState.menuIndex != null && menuState.toolIndex != null
        ? h('div.menu', menu.map((tools, menuIndex) =>
            h('div.tools', tools.map((tool, toolIndex) =>
              h('div.box.tool', { class: { selected: menuIndex == menuState.menuIndex && toolIndex == menuState.toolIndex } }, [
                menuIndex == menuState.menuIndex ? tool : '',
                toolIndex == 0
                ? h('span.shortcut', (menuIndex + 1).toString())
                : null
              ])))))
        : null
      ),
      ...elements.map(e => {
        TEMP.copy(e[0])
        TEMP.project(worldcamera)
        const x = (TEMP.x + 1.0) * 50
        const y = (1.0 - TEMP.y) * 31.395
        if (isNaN(x) || isNaN(y)) return null
        return h('span.hud', { style: { position: 'absolute', left: `${x.toFixed(1)}vw`, top: `${y.toFixed(1)}vw` } }, e[1])
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
