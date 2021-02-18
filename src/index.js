import * as PIXI from 'pixi.js'

const app = new PIXI.Application({ width: 300, height: 500 })
document.body.appendChild(app.view)

app.loader
  .add('background', 'background.jpg')
  .add('bunny', 'bunny.png')
  .load((loader, res) => {
    let back = new PIXI.Sprite(res.background.texture)
    let back2 = new PIXI.Sprite(res.background.texture)
    const bunny = new PIXI.Sprite(res.bunny.texture)

    const camera = new PIXI.Container()

    app.stage.addChild(camera)

    back2.y = -res.background.texture.height

    // Setup the position of the bunny
    bunny.x = app.renderer.width / 2
    bunny.y = app.renderer.height / 2

    // Rotate around the center
    bunny.anchor.x = 0.5
    bunny.anchor.y = 0.5

    // Add the bunny to the scene we are building.
    camera.addChild(back)
    camera.addChild(back2)
    camera.addChild(bunny)

    let vy = 1
    const g = 0.5

    app.ticker.add(() => {
      if (camera.y > back.height - back.y) {
        back.y -= back.height
        back2.y -= back.height
      }

      if (vy > 0) {
        camera.y += vy
      }
      vy += g
      bunny.y += vy

      if (bunny.y > app.renderer.height - 40 - camera.y) {
        vy = -20
      }
    })
  })
