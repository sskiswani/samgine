import { Engine } from "core";

//~ on load Callback
Engine.on("loaded", () => {
    console.info("Engine all loaded!");

    //~ Set up ECS
    // const world = new EntityWorld();
    // world.registerSystem(new FooEntitySystem());

    // let entity = new Entity();
    // entity.add(new BarComponent());

    // world.insertEntity(entity);

    //~ Wire events together
    // Engine.on("update", (dt) => world.update(dt));

    //~ Simple PIXI renderer
    Engine.on("render", (dt) => {
        Engine.renderer.render(Engine.stage);
    });

    //~ Do it.
    Engine.begin();
    // world.initialize();
});

window.onload = () => {
    Engine.init({ pixiArgs: { antialias: true } });
    Engine.load("assets/img/spritesheet.json");
    document.getElementById("game").appendChild(Engine.view);
};
