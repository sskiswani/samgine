import { EntityObserver } from "../core/ecs/EntityObserver";
import { Graphic, Transform } from "../components";
import { Entity, EntityManager } from "../core/ecs";
import { Aspect } from "core/ecs";
import * as PIXI from "pixi.js";

const renderAspect = Aspect.from([Graphic, Transform]);

export class PixiSystem {
    public viewMatrix = new PIXI.Matrix().scale(1, 1);

    public readonly view: PIXI.Container;
    public readonly renderer: PIXI.SystemRenderer;
    private _graphics = [];
    private _observer: EntityObserver;

    constructor(renderer: PIXI.SystemRenderer, view: PIXI.Container) {
        this.view = view;
        this.renderer = renderer;

        let obs = EntityManager.Instance.register(renderAspect);
        obs.onEntityInserted(this.prepare.bind(this));
        obs.onEntityRemoved(this.destroy.bind(this));
        console.info("added obs has ents?", obs.entities);
        obs.entities.forEach(this.prepare.bind(this));
        this._observer = obs;
    }

    protected prepare(entity: Entity) {
        console.info("prepare");
        if (entity.id in this._graphics) { return; }
        let gfx = entity.get<Graphic>(Graphic);

        let sprite = new PIXI.Sprite(PIXI.Texture.fromImage(gfx.path));
        this._graphics[entity.id] = sprite;
        this.view.addChild(sprite);
        console.info("added!");
    }

    protected destroy(entity: Entity) {
        if (!(entity.id in this._graphics)) { return; }

        let sprite = this._graphics[entity.id];
        this.view.removeChild(sprite);
        delete this._graphics[entity.id];
    }

    protected redraw(entity: Entity, newValue) {
        return;
    }
}