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

    constructor(renderer: PIXI.SystemRenderer, view: PIXI.Container) {
        this.view = view;
        this.renderer = renderer;

        let obs = EntityManager.Instance.register(renderAspect);
        obs.onEntityInserted(this.prepare.bind(this));
        obs.onEntityRemoved(this.destroy.bind(this));
    }

    protected prepare(entity: Entity) {
        if (entity.id in this._graphics) { return; }
        let gfx = entity.get<Graphic>(Graphic);

        let texture = PIXI.Texture.fromImage(gfx.path);
        this._graphics[entity.id] = new PIXI.Sprite(texture);
    }

    protected destroy(entity: Entity) {
        if (!(entity.id in this._graphics)) { return; }
        delete this._graphics[entity.id];
    }

    protected redraw(entity: Entity, newValue) {
        return;
    }
}