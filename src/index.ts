import { Engine, ECS } from "core";

//~ on load Callback
Engine.on("loaded", () => {
    //~ Set up ECS
    const world = new ECS.EntityWorld();
    // world.registerSystem(new FooEntitySystem());

    let entity = new ECS.Entity();
    // entity.add(new BarComponent());

    world.insertEntity(entity);

    //~ Wire events together
    Engine.on("update", (dt) => world.update(dt));

    //~ Simple PIXI renderer
    Engine.on("render", (dt) => {
        Engine.renderer.render(Engine.stage);
    });

    //~ Do it.
    Engine.begin();
    world.initialize();
});

window.onload = () => {
    Engine.init({ pixiArgs: { antialias: true } });
    Engine.load("assets/img/spritesheet.json");
    document.getElementById("game").appendChild(Engine.view);
};
