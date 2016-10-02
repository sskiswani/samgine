import { EntityObserver } from "../core/ecs/EntityObserver";
import { Graphic, Transform } from "../components";
import { Entity, EntityManager } from "../core/ecs";
import { Aspect } from "core/ecs";
import * as PIXI from "pixi.js";

const renderAspect = Aspect.from([Graphic, Transform]);

export default class PixiSystem {
    public viewMatrix = new PIXI.Matrix().scale(1, 1);

    public readonly view: PIXI.Container;
    public readonly renderer: PIXI.SystemRenderer;
    private _graphics = [];
    private _observer: EntityObserver;

    constructor(renderer: PIXI.SystemRenderer, view: PIXI.Container) {
        this.view = view;
        this.renderer = renderer;
        console.info("rend?", this.renderer.height);
        let obs = EntityManager.Instance.register(renderAspect);
        obs.onEntityInserted(this.prepare.bind(this));
        obs.onEntityRemoved(this.destroy.bind(this));

        // Collect existing entities
        obs.entities.forEach(this.prepare.bind(this));
        this._observer = obs;
    }

    protected prepare(entity: Entity) {
        if (entity.id in this._graphics) { return; }
        let gfx = entity.get<Graphic>(Graphic);

        let img = PIXI.Texture.fromImage(gfx.path);
        let sprite = new PIXI.Sprite(img);
        sprite.anchor.y = 1;
        this._graphics[entity.id] = sprite;
        this.view.addChild(sprite);
    }

    protected destroy(entity: Entity) {
        if (!(entity.id in this._graphics)) { return; }

        let sprite = this._graphics[entity.id];
        this.view.removeChild(sprite);
        delete this._graphics[entity.id];
    }

    public update() {
        this._observer.entities.forEach(entity => {
            let {position: {x, y}} = entity.get<Transform>(Transform);
            let sprite = this._graphics[entity.id];
            sprite.x = x;
            sprite.y = this.renderer.height - y;
        });
    }
}