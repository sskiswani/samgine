import * as EventEmitter from 'eventemitter3'
import * as _ from 'lodash'
import { IScreen } from './Screen'
import { PIXIRenderer } from './Types'
import { timestamp } from './Utils'

interface InitializationConfig {
    width?: number;
    height?: number;
    rate?: number;
    pixiArgs?: PIXI.RendererOptions
}

class Engine extends EventEmitter {
    static get PIXIRendererOptions(): PIXI.RendererOptions {
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
    handleRendering: boolean = false;

    /**
     * Time spent in the update loop
     */
    frameTime: number;

    private _dt: number = 0;
    private _ticking: boolean = false;
    private _lastTime: number;

    private _screen: IScreen;
    private _renderer: PIXIRenderer;
    private _stage: PIXI.Container;

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
    init(config: InitializationConfig = {
        width: 800, height: 450, rate: 1000 / 60, pixiArgs: {}
    }) {
        let pixiArgs = _.defaults(config.pixiArgs || {}, Engine.PIXIRendererOptions);
        this.frameTime = config.rate || 1000 / 60;

        //~ init PIXI
        this._renderer = PIXI.autoDetectRenderer(config.width || 800, config.height || 450, pixiArgs);
        this._stage = new PIXI.Container();
        this._stage.interactive = true;

        // console.info('Engine initialized!', this);
        this.emit('init');
    }

    /**
     * Begin ticking.
     */
    begin() {
        this._lastTime = performance.now();
        if (!this._ticking) this.tick();
    }

    /**
     * Core loop of the Engine.
     */
    tick() {
        if (!this._ticking) this._ticking = true;
        window.requestAnimationFrame(() => this.tick());

        //~ Update timing
        this._dt = this._dt + Math.min(1, (timestamp() - this._lastTime) / 1000);

        this.emit('tick', this._dt);

        if (this._lastTime === null) return;

        //~ Update step.
        while (this._dt > this.frameTime) {
            this._dt = this._dt - this.frameTime;

            if (this._screen) this._screen.preupdate(this.frameTime);
            this.emit('preupdate', this.frameTime);

            if (this._screen) this._screen.update(this.frameTime);
            this.emit('update', this.frameTime);

            if (this._screen) this._screen.postupdate(this.frameTime);
            this.emit('postupdate', this.frameTime);
        }

        //~ Render step
        if (this._screen) this._screen.prerender(this._dt);
        this.emit('prerender', this._dt);

        if (this.handleRendering) this._renderer.render(this._stage);
        if (this._screen) this._screen.render(this._dt);
        this.emit('render', this._dt);

        if (this._screen) this._screen.postrender(this._dt);
        this.emit('postrender', this._dt);

        //~ Get next frame.
        this._lastTime = timestamp();
    }

    load(...assets: string[]) {
        const loader = new PIXI.loaders.Loader();
        _.each(assets, asset => loader.add(asset, asset));
        loader.once('complete', () => this.emit('loaded'));
        loader.load();
    }

    get renderer() { return this._renderer; }
    get stage() { return this._stage; }
    get view() { return this._renderer.view; }

    get screen() {
        return this._screen;
    }

    set screen(newScreen: IScreen) {
        if (this._screen) this._screen.dispose();
        this._screen = newScreen;
        this._screen.show();
    }

    get isRunning() {
        return this._lastTime !== null && this._ticking;
    }

    private static _instance: Engine;
    get instance() { return Engine._instance; }
}

const _engineInstance = new Engine();
export default _engineInstance;