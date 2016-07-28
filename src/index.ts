import {ECS, Engine, Utils} from './core'
import Input from './core/services/Input'

//~ on load Callback
Engine.on('loaded', () => {
    //~ Set up ECS
    const world = new ECS.EntityWorld();
    // world.registerSystem(new FooEntitySystem());

    let entity = new ECS.Entity();
    // entity.add(new BarComponent());

    world.insertEntity(entity);

    //~ Wire events together
    Engine.on('update', (dt) => world.update(dt));
    Engine.on('tick', Input.tick.bind(Input));

    //~ Sync input to pixi.renderer view
    Input.domEmitter = Engine.view;
    Input.on('mousedown', (ev: MouseEvent) =>
        console.log('mouse down', ev)
    );

    //~ Simple PIXI renderer
    Engine.on('render', (dt) => {
        Engine.renderer.render(Engine.stage);
    });

    //~ Do it.
    Engine.begin();
    world.initialize();
});

window.onload = () => {
    Engine.init({ pixiArgs: { antialias: true } });
    Engine.load('assets/img/spritesheet.json');
    document.getElementById('game').appendChild(Engine.view);
};
