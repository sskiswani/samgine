import { EntityManager } from "./core/ecs/EntityManager";
import { Transform } from "./components";
import { Graphic } from "./components/Graphic";
import { Entity } from "./core/ecs/Entity";
import { PixiSystem } from "./systems/PixiSystem";
import { Engine } from "core";

const em = EntityManager.Instance;

// on load callback
Engine.on("loaded", () => {
    em.add(new Entity().add(
        new Transform({}),
        new Graphic({ path: "water.png" })
    ));

    const pixi = new PixiSystem(Engine.renderer, Engine.stage);

    Engine.on("tick", fps => {
        // TODO
    });

    Engine.on("update", deltaTime => {
        // TODO
    });

    Engine.on("render", deltaTime => {
        Engine.renderer.render(Engine.stage);
    });

    Engine.begin();
});

window.onload = () => {
    Engine.init({ pixiArgs: { antialias: true, backgroundColor: 0x000 } });
    Engine.load("sprites.json");
    document.getElementById("game").appendChild(Engine.view);
};
