import { Engine } from "core";

// on load callback
Engine.on("loaded", () => {

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
