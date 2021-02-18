import * as PIXI from 'pixi.js'
import { keyboard } from './keyboard'

let app = new PIXI.Application({
  width: 400,
  height: 600,
})
document.body.appendChild(app.view)

app.loader
  .add('img/lik.json')
  .add('fon', 'background.jpg')
  .add('playAgain', 'playAgain.png')
  .add('play', 'play.png')
  .load(setup)

let stageHeight = app.renderer.height
let stageWidth = app.renderer.width

const camera = new PIXI.Container()
app.stage.addChild(camera)

const world = {
  gravity: 0.1,
  bounce: -6,
  height: 600,
}

const plat = {
  width: 36,
  height: -12,
}

const jumpHeight = (world.bounce * world.bounce) / (world.gravity * 2)
let platX = stageWidth / 2 - 18
let platY = stageHeight - 20
console.log(jumpHeight)
let jumper,
  state,
  skobka,
  koord = []
let difficulty = 0
let ease = 50
let skobkaCount = 0
let fon, playOn, playAgain

function setup(loader, resources) {
  let react = () => {
    let left = keyboard(37)
    let up = keyboard(38),
      right = keyboard(39),
      down = keyboard(40),
      w = keyboard(87),
      a = keyboard(65),
      s = keyboard(83),
      d = keyboard(68)

    left.press = a.press = () => {
      jumper.vx = -5
      jumper.textures = [arr[0], arr[1]]
      jumper.gotoAndStop(1)
    }

    left.release = a.release = () => {
      jumper.vx = 0
    }

    right.press = d.press = () => {
      jumper.vx = 5
      jumper.textures = [arr[2], arr[3]]
      jumper.gotoAndStop(1)
    }

    right.release = d.release = () => {
      jumper.vx = 0
    }
  }

  let acl = new Accelerometer({frequency: 60});

  acl.addEventListener('reading', () => {
  console.log("Acceleration along the X-axis " + acl.x);
  console.log("Acceleration along the Y-axis " + acl.y);
  console.log("Acceleration along the Z-axis " + acl.z);
  });

  acl.start();

  //#region sprites
  let sheet = resources['img/lik.json']

  fon = new PIXI.TilingSprite(resources.fon.texture, 600, 600)
  fon.position.set(0, 0)
  camera.addChild(fon)
  const arr = Object.values(sheet.textures)

  jumper = new PIXI.AnimatedSprite([arr[0], arr[1]])
  jumper.gotoAndStop(1)
  jumper.x = stageWidth / 2 - jumper.width / 2
  jumper.vx = 0
  jumper.vy = 0


  playOn = new PIXI.Sprite(resources.play.texture)
  playOn.position.set(100, 400)
  playOn.width = 200
  playOn.height = 50
  playOn.interactive = true
  playOn.buttonMode = true

  playOn
    .on('pointerdown', start)
    .on('pointerover', effect)
    .on('pointerout', antieffect)

  app.stage.addChild(playOn)

  playAgain = new PIXI.Sprite(resources.playAgain.texture)
  playAgain.position.set(100, 400)
  playAgain.width = 200
  playAgain.height = 50
  playAgain.interactive = true
  playAgain.buttonMode = true

  playAgain
    .on('pointerdown', start)
    .on('pointerover', effect)
    .on('pointerout', antieffect)

  //#endregion

  platRenderer()
  react()

  state = play
  app.ticker.add((delta) => gameLoop(delta))
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function gameLoop(delta) {
  state(delta)
}

function play(delta) {
  move()
}

let platRenderer = () => {
  for (let i = 0; i < 300; i++) {
    mainPlat(platX, platY)
    koord[i] = {
      x: platX,
      y: platY,
    }
    if (difficulty<100) {
    difficulty = Math.floor(Math.abs(platY-world.height)/100)}
    ease = (jumpHeight*(difficulty)/100)-plat.height*3
    
    // console.log(ease)
    platX = randomInt(0, stageWidth - jumper.width)
    platY -= randomInt(Math.abs(plat.height * 3), ease)
    skobkaCount++
  }
}

let mainPlat = (x, y) => {
  skobka = new PIXI.Graphics()
  skobka.lineStyle(5, 0xfdfefe, 1)
  skobka.antialising = true
  skobka.x = x
  skobka.y = y
  skobka.bezierCurveTo(
    plat.width / 3,
    plat.height,
    (plat.width / 3) * 2,
    plat.height,
    plat.width,
    0
  )
  camera.addChild(skobka)
}

let move = () => {
  jumper.x += jumper.vx
  jumper.vy += world.gravity
  jumper.y += jumper.vy
  if (jumper.x + jumper.width < 0) {
    jumper.x += stageWidth+jumper.width
  }
  if (jumper.x > stageWidth) {
    jumper.x -= stageWidth+jumper.width
  }

  if (
    jumper.vy < 0 &&
    jumper.y + camera.y - jumper.height / 2 < stageHeight / 2
  ) {
    camera.y -= jumper.vy
    fon.tilePosition.y -= jumper.vy
    fon.y += jumper.vy
  }
  jump()

  if (jumper.y + camera.y > world.height) {
    death()
  }
}

let death = () => {
  app.stage.addChild(playAgain)
  camera.removeChild(jumper)
}

let start = () => {
  playAgain.alpha = 1
  app.stage.removeChild(playAgain)
  app.stage.removeChild(playOn)
  camera.addChild(jumper)
  fon.tilePosition.y = 0
  fon.y = 0
  camera.y = 0
  jumper.x = stageWidth / 2 - jumper.width / 2
  jumper.y = stageHeight / 2
  jumper.vy = 0
  //platRenderer()
}

// let menu = () =>

let effect = () => {
  playAgain.alpha = 0.5
  playOn.alpha = 0.5
}

let antieffect = () => {
  playAgain.alpha = 1
  playOn.alpha = 1
}

let jump = () => {
  let yf = jumper.y + jumper.height

  for (let i = 0; i < skobkaCount; i++) {
    if (
      yf > koord[i].y + plat.height &&
      yf < koord[i].y + plat.height + 10 &&
      jumper.x + (jumper.width * 2) / 3 > koord[i].x &&
      jumper.x + jumper.width / 3 < koord[i].x + plat.width &&
      jumper.vy > 0
    ) {
      jumper.vy = world.bounce
      jumper.loop = false
      jumper.animationSpeed = 0.1
      jumper.gotoAndPlay(0)
      // console.log(camera.y)
    }
  }
}
