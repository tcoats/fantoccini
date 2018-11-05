# Fantoccini

## Editor
- [x] HTML overlay
- [ ] Pause / play
- [ ] Mouse select
- [ ] [Outline](https://threejs.org/examples/webgl_postprocessing_outline.html)
- [ ] Create and edit boxes [Example](https://threejs.org/examples/misc_animation_authoring.html) [Animation Key Frame](https://threejs.org/examples/misc_animation_keys.html)
- [ ] Constrain axis
- [ ] Ray distance tests
- [ ] Test constraint system

## Character
- [ ] Design starfish dude
- [ ] Generate dude mesh from primative skeleton
- [ ] [Morph](https://threejs.org/examples/webgl_buffergeometry_morphtargets.html)
- [ ] Content aware 3rd person camera
- [ ] Edge detection for grabbing

## Style
- [ ] [SAO](https://threejs.org/examples/webgl_postprocessing_sao.html) / [SSAO](https://threejs.org/examples/webgl_postprocessing_ssao.html) / [PCSS](https://threejs.org/examples/webgl_shadowmap_pcss.html)
- 3D geometry for effects
- Simple flat materials & lighting
- Maybe shadows and ambient occlusion
- [Lambert](https://threejs.org/examples/webgl_materials_variations_lambert.html)
- [Toon](https://threejs.org/examples/webgl_materials_variations_toon.html)

# Jucy
- [B&W Spotted](https://threejs.org/examples/webgl_postprocessing.html)
- [Glitch](https://threejs.org/examples/webgl_postprocessing_glitch.html)
- [Crossfade](https://threejs.org/examples/webgl_postprocessing_crossfade.html)
- [Bokeh](https://threejs.org/examples/webgl_postprocessing_dof2.html)
- [Pixel](https://threejs.org/examples/webgl_postprocessing_pixel.html)
- [Retro Vectors](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html)


# AI
https://www.oreilly.com/ideas/the-current-state-of-machine-intelligence-2-0
http://tjo-en.hatenablog.com/entry/2016/04/18/190000


# Fantoccini

3D model with bones in blender


Here are the project components:

A physically simulated, rigged, rag doll character with bones, simulated muscles and joints with degrees of freedom.

A motion control system to pilot the rag doll that blends behaviour animations with a physics simulation.

A set of low level objective based behaviours that may need to be optimised offline.
- Transition between poses, turning
- Reach for a location within range of movement
- Sit down, stand up
- Stepping over or on to something
- Recover from falling over due to rag dolling
- Move head to face direction
- Look under something

A planning system to string together low level behaviours into high level tasks, including non-functional behaviours.
- Transitioning between idle, walk, run, jump.
- Protecting face and body during a fall
- Looking at path when moving
- Breathing

Detection or map hinting of interactive aspects of the game environment. Flat surfaces that can be walked on, edges that can be grabbed, handles that can be pushed or pulled, small spaces that need crouching, lying down or other physical shimmy behaviour.

Link the character planning system to the environment.
- Run to door and grab handle, open door and walk through.
- Duck under pipes, drop down and pull body into ventilation shaft.
- Crawl to edge, grab edge and drop down over edge.

Detection of interactive aspects of dynamic game objects.
- Picking up weapon, holding weapon, reloading gun.
- Backpack.
- Picking up things, carrying things.
- Throwing things.

Link the character planning system to user input. User input provides direction to the planning system, but the planning system decides how to act.
- Running at a wall will cause the character to hold arm in front of face and rotate sideways but still run into the wall.
- Walking into a wall will cause the character to stop before reaching it.
- Crouching and walking into a wall will cause the character to press up against the wall and move stealthily.

A 3rd person follow camera that avoids obstacles and focuses on where the target is moving towards, planning a smooth bezier motion to reach the best position. The camera only moves when the target moves.

Game specific extensions

Add status conditions on behaviour to adjust actions.
- Hurt leg will cause limp
- Knocked out will cause loss of action

Add parkour behaviours.
- Running along walls, flips, break falls.
- Diving, sliding, sideways slide.
- Gymnastics, vaulting, grabbing edges.

Add character to character interactions.
- Grab arm
- Holds, grappling.
- Punching, kicking.

Add destroyable, deformable environment and items


# Interaction Editor

## Pose Slots
The keys 0 - 9 are pose slots. Tapping a number will load the pose in that slot, holding a number will save the current pose to that slot.

(Advanced) Each slot can hold 5 poses, tapping a number repeatedly will cycle through the available poses in that slot. Holding a number will push the current pose to the top of that slot. This is invisible to the user and they can just use the system like above. The previous definition will be how it's described first time.

Common poses will probably be: Standing, Walking, Running, Jumping, Falling, etc.

## World
The world can be rotated, zoomed and panned like a normal 3D program. Not entirely sure which one I will copy but it will be through mouse movement and modifier keys.

The default world will have as many key 'locations' as possible which will act as triggers for actions. Moving the puppet within a certain radius of key features of the environment will add these to the potential triggers for any actions setup from that location.

## Pin Board
The editor consists of several modes. The first mode is 'pin board' where everything seems frozen in jelly. Clicking on the physics primitives that make up the puppet will unfreeze that object but everything else connected will be 'reluctant' to move. They will move if they have to but otherwise will stay still. This mode is for positioning. Each model has a global 'marionette' that can move the model all at once. Using this mechanism the creator can move the puppet to a trigger pose and start viewing and editing the actions linked to that pose.

## Triggers
Pose, Environment, External Triggers (Keyboard, Mouse, Script), State

A trigger is weighted in importance allowing fuzzy matching of imperfect starting conditions. Each action has a weighted list of triggers that have to be met for the action to perform. When editing the triggers of an action the importance of each potential trigger is painted on. This is done in a circle that shows up with the pose in the center, the environment features around it and other external triggers around the outside. From the side of the editor interface external triggers and states can be dragged in and added to the painting. Each trigger weighting can be manually edited through a circle size widget.

## Actions
An action is a timed sequence of forces, constraints, state and scripts applied to the puppet. Once triggers have been setup the editor goes into action editing mode. In this mode a timeline appears and is measured in frames after the action was triggered. The keyframe method is used to construct actions. At a given time the puppet is moved to a new pose and weight is given to this move in a similar way to trigger weightings. There are two weights that can be contained in a keyframe and they are usually used at the same time. Impulse is which parts and how strongly the puppet is moved to the new pose. Limits are how far the puppet can move from these new positions and states before the action is cancelled. Both impulse and limits can include weights for states, external triggers and scripts.

# Keyframes
Each keyframe is a separate entity. Multiple keyframes can exist in the same frame and be for different things. A keyframe can be linked to two other keyframes, one previous and one next. Each keyframe has a heat up and a cool off; a curve for how to apply the impulse over time. The start points for these curves can be dragged onto another keyframe, linking them.

## Features
These editing sessions are designed to be easy and powerful. The view will overlay previous keyframe visuals so an idea of the animation is visible; onion skinning. Holding space will play from the current frame onwards, releasing will snap back to the current frame. Tapping space will play normally, pressing space again will pause. Actions run simultaneously so controlling the legs can be independent of the upper body.

## Style Guidelines
Instead of creating long complex animations it is suggested that stringing multiple actions together may work better.

## Scripts
This setup makes specialised scripting almost unnecessary but some actions will require it. Interacting with the environment through switches, buttons and objects will have scripted side effects. Generating the constraints of grabbing a ledge will also be scripted.

## Wall hugging
Pressing crouch and moving into a high enough wall will cause you to stand with your back to the wall. You will stay like this as long as you continue to attempt to move into the wall. Moving along the wall can be done by using the movement keys. When you get to a corner, you will look around the corner before moving around it.

## Ledges
Walking up to a small step will cause you to take a bigger step to get over it. Walking up to a medium height ledge and pressing jump will cause you to pull yourself up onto it. If the wall is over head height, jumping and moving forward will cause you to grab a hold of the ledge and hang there. While hanging you can shuffle left and right and around corners. Releasing forward will cause you to drop. Pressing jump will cause you to pull yourself up. You can also get a hold of a ledge if you jump and don’t quite make it, if you hit the ledge and hold forward you will grab a hold of it and hang there.

## Body Realism
If you do a roll and hit a wall before you are finished you will sustain damage. If you sprint or run into a wall you will get hurt. If you run into someone then you both may fall over, if you are going faster then they probably will fall over. If you walk past a corner and you clip it with your arm or gun then your body will show that movement. If you are moving fast and your feet catch a ledge, then you will trip. If there is an explosion next to you you will ragdoll until you come to a rest (enough to get up again). If someone kicks you in the leg you probably will fall over. You can still kick and punch if you are on the ground. If someone chops off your arm then you won’t be able to use a weapon with it (and you don’t have long to live). While sprinting and running the character will lean into the run and if you change direction, will lean that direction (this is what some current games lack).

I'm planning to address the concepts you outline in my fps when it gets made. I have a page on my website where I record my notes.

It addresses what I call 'Environment Interaction'. A human can step over, climb up, grab onto almost anything. This is missing in games. What I want to do it create a system that mixes the right amount of parkour, ledge grabbing in Urban Terror, walking in Jedi Academy... These are examples of what is done well at the moment, I want to take them and extend it. The demo for Assassin's Creed appears close to how I think it should work.

However all this doesn't draw a line between 1st person and 3rd person. The environment interaction is great in 3rd person but doesn't work as well in 1st person. I haven't worked out which one is best - but I'm leaning towards a Max Payne / Gears of War perspective. I believe this would capture the freedom of 3rd person movement and the accuracy of 1st person. Depending on what you are doing (running, sniping, melee fighting) the camera will zoom out or in. Like the Call of Duty series a 'zoom' button will aim down a guns sights changing into a much more 1st person view.

I think this is the best way to do it, unfortunately it requires moving away from 1st person perspective. Otherwise you would practically never see your gun (unless aiming). But I don't think this is as bad as it initially seems. So I don't know... still designing.

Edit:

Oh and it's totally possible to ragdoll and get up - check out Naturalmotion - Endorphin

I'm quite busy at the moment with work which might not stop any time soon. I do plan to create a 'stickman' ragdoll and start animating that to play with some ideas. The problem is that I want to create a scripting language first. I believe that the algorithms that control balance, walking, and all other algorithms that interact with a ragdoll model need to be tweaked on the fly to get to a stable and nice game feel. For this I want to use a special purpose scripting language that I'm building. The design is complete I just need to code it :(

The problems I see for this style of animation is that you can't just use canned animation from a 3D program. Even if you managed to blend walking around corners with the animation - I'm sure you would still get legs passing through each other and terrible things like that.

I've been doing quite a bit of research into physics systems. I plan to have a way to animate a ragdoll using impulses. The animation can decide how much emphasis to put on each action and how much to leave to the ragdoll. A lot of it will be target based - such as an edge of a building or a rung of a ladder. The animation will create a temporary bond from the hand to the rung, tense the biceps and thigh muscles but leave the rest to the ragdoll. This means that if a wind blows the character then will sway. If the force is too much the bond between the hands and the rungs will snap and the character will fall.

All this needs to work closely to an events system to trigger these interactions. Once the character starts to fall forces need to be put in place to: make sure the character stays upright (cheating but this is important) and position the character in a believable fall stance. If a ledge or ladder rung is close (certain area) and the 'grab' key is held a new trigger should fire...

I probably have a lot of work to do but it's exciting. Too bad I have a job. If only I could convince them that making computer games is the way to go.

Looks like I'm looking forward to at least two games: Assassins Creed and Stranglehold.

I do understand why the first person perspective is used. In these type of games you are the character or you are playing the character. Max Payne has quite a distinct personality while Gordon Freeman and Master Chief have little personality. That's a lot of the difference between 1st and 3rd person perspectives.

When talking about the scaryness factor of 3rd person games it's more in line with movies - scariness by proxy. The player is scared for the character. This isn't bad, but should be noted that it's a different feeling.

To feel interaction with the world:

See your character interact with the world.

* 3rd person - see the character jump, run, bump into, pull etc. Quite a bit of freedom.

* 1st person - gun firing, hands interacting, sword / saber attacking - mostly limited to hands.

Have the world respond to your interaction.

* 1st & 3rd person, push, smash, break.

'Feel' the world interacting back at you.

* 3rd person - minimal - force feedback. Camera movement doesn't really make sense.

* 1st person - camera movement (earthquake / shake), run bob, smashed 'screen', red pulse (hurt).

Sound is important in all these situations as well.

I quite liked goldeneye's death sequence... the wobble, fall down and fade to red.


I think there's a lot to be said on this topic, I'd like to share my opinion on realism/immersion/"fun".

I personally think that the trick is to view the player as a director, not giving the player absolute control over every detail, but enough to control what is happening. And the character (orchestra) should never do anything the director doesn't expect. I'm not saying that the story and whatnot should be predictable, but that the character should behave in the way that the player expects. If that's through dialogue (or lack thereof), movements (tripping and falling) doesn't really matter, if the character breaks with the player's expectation you have weakened the players belief in the illusion, or his immersion.

These are the words and metaphor to what I was thinking, thank you.

You bring up in interesting point - how does the computer know when the player wants to do something, how does it know when to 'cheat'? The player should obviously be provided with a subset of everything that is possible in real life. I think the subset normally provided in games these days is constricted and could be wider without the annoyance of computer mistakes.

I think that through the implementation of a set of verbs that are communicated through verb 'keys' would make it easier for the computer and the player.

This is how I plan to do things in my game:

Jump really means push off with your legs. This could also be used for swimming... hold then let go for a swim movement.

Crouch would really mean pull your legs in. Falling through the air, crouch would mean tuck your legs in and do a roll when hitting the ground. Or at the start of a jump crouch would mean do a flip.

The movement keys really mean get my body in that direction using legs and arms. On a ladder up is climb further up. On a ledge left and right are shuffle along. Crawling is similar to walking.

Looking around with the mouse really means turn my head to look in that direction, then shift my focus in that direction - aim gun, move body around a bit, shifts the direction of actions. The computer knows you are focusing in that direction and will make actions sensitive to that. Movement is a great example.

What I enjoy doing is taking these verbs and finding out what key combinations mean. Tapping the forward key then holding it (1.5 clicks). My current feeling is this should be something greater than what forward normally does. I'm thinking sprint.

Pressing jump then jump again in the air. This one isn't so great perhaps, but I think this could mean 'dive'. If you are travelling in a direction this would cause your character to dive in the same direction.

Then these actions can be strung together even more. I'm thinking performing a dive in a direction then holding crouch will make the character do a dive then a roll at the end. Holding what I call the 'hands' key during a roll over a weapon will result in it being picked up.

As you may be able to see this system provides a nice language to communicate with a game that is context sensitive and combinations of the verbs hopefully result in actions that make sense.

My current answer to the 'run up a wall' question: it requires a jump to start off, a crouch to rotate backwards a bit (with the camera?) forward to tell the computer you want to run up it, then another jump to push off and another crouch to do a flip so you land on your feet. This sounds complicated but it can be chunked... it's just jump -> crouch, jump -> crouch. I think a player would learn these extended actions quite quickly so performing a jump -> crouch would be thought of as one action.

Note: ‘Puppeteering’ in Assassins Creed is very similar to this


# Technique: Sandbox

This game will consist of many 'sandboxes', sections of worlds separate from each other. The different sandboxes can be from different eras, have different control styles and different physics. There will be a few things the same about them, they will all be 3d and they will all be physically 'complete'. That is to say that all the terrain, buildings, ground, water are all made up of physically simulated materials. An explosion will leave a crater and further destruction, removing the support for a bridge will cause it to fall and characters can have limbs cut off.

The aim is for realism in terms of playability, not graphics. Controlling your avatar will be smooth and you will feel that you are really in control. Your character will have adaptive animation and physical interaction making the gameplay more immersive. Walking will be true to the terrain, not a canned animation. If your charater's arm brushes against the wall, the torso will rotate, an explosion nearby will cause you to be thrown away from it.


http://www.joshkeyes.net/