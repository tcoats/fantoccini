# Fantoccini

http://evanw.github.io/csg.js/
https://github.com/mxgmn/WaveFunctionCollapse
http://www.procjam.com/tutorials/wfc/
https://www.reddit.com/r/VoxelGameDev/comments/9yu8qy/palettebased_compression_for_chunked_discrete/

## Move tool
- All unconstrained = plane normal to camera
- One constrained = plane on both unconstrained axies
- Two constrained = line on unconstrained axis
- Three constrained = nothing happening
- Planes need to be `side = three.DoubleSide`

## Layers
1. Default
2. Menu FX
3. Plane and line math for tools
4. General FX

## Editor
- [x] Refactor selection to use [Group](https://threejs.org/docs/index.html#api/en/objects/Group) to make edits easier
- [x] Refactor spotlight to use layers
- [x] Why is moving object out of sync with selection outline?
- [ ] Work out two constrained line math
- [ ] Design move tool plane generation
- [ ] Move tool
- [ ] Scale tool - is origin based on crosshair?
- [ ] Rotate tool - is origin based on crosshair?
- [ ] Physics grab tool
- [ ] Group / ungroup?
- [ ] Character type asset template
- [ ] Enter / exit 3rd person control against character
- [ ] Test constraint system

## Perhaps
- [ ] Drag JSON file to execute commands (e.g. config / levels)
- [ ] Numeric entry?
- [ ] Detect angle of drag for click threshold

## Character
- [ ] Ragdoll armature
- [ ] Global marionette / wires for balance
- [ ] Impulse based motion, IK + target pose
- [ ] Low level blending of impulses
- [ ] Enviroment detection / hinting
- [ ] User controls hinting
- [ ] High level blending of impulses
- [ ] Onion skinning of future frames while adjusting parameters

## Behaviour editor
- [ ] Timeline view - how does this work in 3D?
- [ ] Pose slots as number keys, hold pushes, tap to cycle through
- [ ] Save pose to timeline
- [ ] Pose heatup and cooloff
- [ ] Set input against timeline to understand how things change
- [ ] Environment weighting

## Jucy
- 3D geometry for effects
- Simple flat materials & lighting
- [Outline](https://threejs.org/examples/webgl_postprocessing_outline.html)
- [Example UI](https://threejs.org/examples/misc_animation_authoring.html)
- [Animation Key Frame](https://threejs.org/examples/misc_animation_keys.html)
- [SAO](https://threejs.org/examples/webgl_postprocessing_sao.html) / [SSAO](https://threejs.org/examples/webgl_postprocessing_ssao.html) / [PCSS](https://threejs.org/examples/webgl_shadowmap_pcss.html)
- [Lambert](https://threejs.org/examples/webgl_materials_variations_lambert.html)
- [Toon](https://threejs.org/examples/webgl_materials_variations_toon.html)
- [B&W Spotted](https://threejs.org/examples/webgl_postprocessing.html)
- [Glitch](https://threejs.org/examples/webgl_postprocessing_glitch.html)
- [Crossfade](https://threejs.org/examples/webgl_postprocessing_crossfade.html)
- [Bokeh](https://threejs.org/examples/webgl_postprocessing_dof2.html)
- [Pixel](https://threejs.org/examples/webgl_postprocessing_pixel.html)
- [Retro Vectors](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html)

## Ideas
- [ ] https://github.com/kchapelier/wavefunctioncollapse
- Sea creature / statistics engine
