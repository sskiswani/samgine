import { Aspect } from "core/ecs";


export class TestSystem {
    private _view: PIXI.Container;
    private _renderer: PIXI.Container;

    constructor(renderer, view, opts = { width: 600, height: 400 }) {
        this._view = view;
        this._renderer = renderer;
    }
}