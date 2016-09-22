import { Engine } from "core";

// on load callback
Engine.on("loaded", () => {
    //~ Connect to the engine by registering callbacks

    // tick is called once at the beginning of every frame
    Engine.on("tick", fps => {
        // tick logic here...
    });

    // next update is called as many times as possible within the target fps
    Engine.on("update", deltaTime => {
        // update logic here...
    });

    // render is called at the end of every frame,
    // at an interval as close to the target fps as possible.
    Engine.on("render", deltaTime => {
        // render logic here...

        // optionally, let the engine handle the render step
        Engine.renderer.render(Engine.stage);
    });

    // do it!
    Engine.begin();
});

window.onload = () => {
    Engine.init({ pixiArgs: { antialias: true } });
    Engine.load("assets/img/spritesheet.json");
    document.getElementById("game").appendChild(Engine.view);
};
