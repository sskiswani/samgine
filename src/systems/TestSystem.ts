import { Aspect } from "core/ecs";

const RenderAspect = new Aspect("Transform");

export class TestSystem {
    private _view: PIXI.Container;
    private _renderer: PIXI.Container;

    constructor(renderer, view, opts = { width: 600, height: 400 }) {
        this._view = view;
        this._renderer = renderer;
    }
}