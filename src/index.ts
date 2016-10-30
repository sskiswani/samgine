import { Graphic, Transform, Tilemap } from "./components";
import { Entity } from "./core/ecs/Entity";
import { EntityManager } from "./core/ecs/EntityManager";
import InputSystem from "./systems/InputSystem";
import PixiSystem from "./systems/PixiSystem";
import { Engine } from "core";

const em = EntityManager.Instance;

// on load callback
Engine.on("loaded", () => {
    Engine.handleRendering = true;

    em.add(new Entity().add(
        new Transform(),
        new Graphic({ path: "alien_front" })
    ));

    em.add(new Entity().add(
        new Transform(),
        new Tilemap(10, 10)
    ));

    const systems = {
        pixi: new PixiSystem(Engine.renderer, Engine.stage),
        input: new InputSystem()
    };

    Engine.on("update", deltaTime => {
        systems.input.update();
    });

    Engine.on("render", deltaTime => {
        systems.pixi.update();

        // let engine render
        Engine.renderer.render(Engine.stage);
    });


    Engine.begin();
});

window.onload = () => {
    Engine.init({ pixiArgs: { antialias: true, backgroundColor: 0, transparent: true } });
    Engine.load("sprites.json");
    document.getElementById("game").appendChild(Engine.view);
};
