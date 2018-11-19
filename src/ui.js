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

  let scripts = null
  ecs.on('scripts available', (id, s) => scripts = s)
  let isexecute = false
  let currentInput = ''
  let scriptOptions = []
  let selectedOption = 0
  const keys = {
    up: 38,
    down: 40
  }
  const onkeyup = (e) => {
    if (scriptOptions.length == 0) return
    switch (e.keyCode) {
      case keys.down:
        selectedOption++
        selectedOption = Math.min(selectedOption, scriptOptions.length - 1)
        break;
      case keys.up:
        selectedOption--
        selectedOption = Math.max(0, selectedOption)
        break;
    }
  }
  ecs.on('menu execute', () => {
    document.addEventListener('keyup', onkeyup)
    isexecute = true
    currentInput = ''
    scriptOptions = []
  })
  ecs.on('input disabled', () => {
    document.removeEventListener('keyup', onkeyup)
    isexecute = false
  })
  ecs.on('input updated', (id, input) => {
    if (!isexecute) return
    currentInput = input
    if (currentInput == '') {
      selectedOption = 0
      scriptOptions = []
      return
    }
    scriptOptions = scripts.filter((s) => s.indexOf(currentInput) == 0)
    selectedOption = 0
  })
  ecs.on('input submitted', (id, input) => {
    document.removeEventListener('keyup', onkeyup)
    scriptOptions = scripts.filter((s) => s.indexOf(currentInput) == 0)
    if (scriptOptions.length > 0) ecs.emit(scriptOptions[selectedOption])
  })

  const h = require('snabbdom/h').default
  const TEMP = new three.Vector3()
  const ui = (state, params, ecs) => {
    if (isexecute) return h('div#root', h('div.centered', h('div.autocomplete', [
      h('div.option', currentInput.length > 0 ? currentInput : 'type script name to execute...'),
      ...scriptOptions.map((s, i) => i == selectedOption ? h('div.box', [s, h('span.shortcut', 'ENTER')]) : h('div.option', s))
    ])))

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
        h('div.menu', [
          ...menu.map((tools, menuIndex) =>
            h('div.tools', tools.map((tool, toolIndex) =>
              h('div.box.tool', { class: { selected: (menuState && (menuState.current == tool || (menuIndex == menuState.menuIndex && toolIndex == menuState.toolIndex))) } }, [
                tool,
                toolIndex == 0
                ? h('span.shortcut', (menuIndex + 1).toString())
                : null
              ])))),
          (menuState && menuState.previous
          ? h('div.tools', h('div.box.tool', [
            menuState.previous,
            h('span.shortcut', 'Q')]))
          : null),
          h('div.tools', h('div.box.tool', [
            'execute',
            h('span.shortcut', 'E')]))
        ])
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
