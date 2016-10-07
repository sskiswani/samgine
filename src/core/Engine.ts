import {EventEmitter} from "eventemitter3";
import * as _ from "lodash";
import * as PIXI from "pixi.js";

interface InitializationConfig {
    width?: number;
    height?: number;
    rate?: number;
    pixiArgs?: PIXI.RendererOptions;
}

const EVENTS = {
    INITIALIZED: "initialized",
    PREUPDATE: "preupdate",
    UPDATE: "update",
    TICK: "tick",
    POSTUPDATE: "postupdate",
    PRERENDER: "prerender",
    RENDER: "render",
    POSTRENDER: "postrender",
    LOADED: "loaded"
};

class Engine extends EventEmitter {
    public static eventStrings: Object = EVENTS;

    private static _instance: Engine;

    public static get instance() { return Engine._instance; }

    public static get PIXIRendererOptions(): PIXI.RendererOptions {
        return {
            backgroundColor: 0x1099bb,
            antialias: true,
            resolution: 1,
            clearBeforeRendering: true
        };
    }

    /**
     * Whether or not the Engine should call render on the renderer.
     */
    public handleRendering: boolean = false;

    /**
     * Time spent in the update loop
     */
    public frameTime: number;

    private _dt = 0;
    private _now = 0;
    private _ticking = false;
    private _lastTime = 0;

    private _renderer: PIXI.SystemRenderer;
    private _stage: PIXI.Container;

    public get isRunning() { return this._lastTime !== null && this._ticking; }
    public get renderer() { return this._renderer; }
    public get stage() { return this._stage; }
    public get view() { return this._renderer.view; }

    constructor() {
        super();
        Engine._instance = this;

        this._dt = 0;
        this._ticking = false;
        this._lastTime = null;
    }

    /**
     * Initialize the engine.
     */
    public init(config: InitializationConfig = {
        width: 800, height: 450, rate: 1 / 60, pixiArgs: {}
    }) {
        let pixiArgs = _.defaults(config.pixiArgs || {}, Engine.PIXIRendererOptions);
        this.frameTime = config.rate || (1 / 60);

        //~ init PIXI
        this._renderer = PIXI.autoDetectRenderer(config.width || 800, config.height || 450, pixiArgs);
        this._stage = new PIXI.Container();
        this._stage.interactive = true;

        this.emit(EVENTS.INITIALIZED);
    }

    /**
     * Begin ticking.
     */
    public begin() {
        this._lastTime = this.getTimestamp();
        if (!this._ticking) { this.tick(); }
    }

    public getTimestamp() {
        return performance.now();
    }

    /**
     * Core loop of the Engine.
     */
    public tick() {
        if (!this._ticking) { this._ticking = true; }

        window.requestAnimationFrame(() => this.tick());

        //~ Update timing
        this._now = this.getTimestamp();
        this._dt = this._dt + Math.min(1, (this._now - this._lastTime) / 1000);

        this.emit("tick", this._dt);

        if (this._lastTime === null) { return; }

        //~ Update step.
        while (this._dt > this.frameTime) {
            this._dt = this._dt - this.frameTime;

            this.emit(EVENTS.PREUPDATE, this.frameTime);
            this.emit(EVENTS.UPDATE, this.frameTime);
            this.emit(EVENTS.POSTUPDATE, this.frameTime);
        }

        //~ Render step
        this.emit(EVENTS.PRERENDER, this._dt);

        if (this.handleRendering) { this._renderer.render(this._stage); }

        this.emit(EVENTS.RENDER, this._dt);

        this.emit(EVENTS.POSTRENDER, this._dt);
        this._lastTime = this._now;
    }

    public load(...assets: string[]) {
        const loader = new PIXI.loaders.Loader();
        _.each(assets, asset => loader.add(asset, asset));
        loader.once("complete", () => this.emit(EVENTS.LOADED));
        loader.load();
    }
}

const _engineInstance = new Engine();
export default _engineInstance;