import * as EventEmitter from 'eventemitter3'
import * as _ from 'lodash'
import { forceArray, Key } from '../Utils'

export const DEFAULT_CONTROLS: KeyMapping = {
    left: [Key.LEFT, Key.A],
    right: [Key.RIGHT, Key.D],
    up: [Key.UP, Key.W],
    down: [Key.DOWN, Key.S],
    space: [Key.SPACEBAR]
};

export const Controls = _.keys(DEFAULT_CONTROLS);

interface KeyMapping {
[id: string]: number | number[]
}

interface KeyBindings {
    [id: string]: Binding
}

class Binding {
    keyCodes: number[];
    private _prev: boolean = false;
    private _curr: boolean = false;

    constructor(keys: number | number[]) {
        this.keyCodes = typeof keys === 'number' ? [keys] : keys;
    }

    tick() {
        this._prev = this._curr;
    }

    get isUp() { return this._curr === false; }
    get isDown() { return this._curr; }
    get wasPressed() { return this._curr && this._prev === false; }
    get wasReleased() { return this._prev && this._curr === false; }
}

class Input extends EventEmitter {
    private static _instance = new Input();
    static get instance() { return Input._instance; }

    private _domEmitter: EventTarget;
    private _bindings: KeyBindings = {};
    private _mouse = new PIXI.Point();

    get mouse() { return this._mouse; }

    set domEmitter(emitter: EventTarget) {
        if (this._domEmitter) {
            this._domEmitter.removeEventListener('contextmenu', this.contextmenu, false);
            this._domEmitter.removeEventListener('keydown', this.onkeydown, false);
            this._domEmitter.removeEventListener('keyup', this.onkeyup, false);
            this._domEmitter.removeEventListener('mousemove', this.onmousemove, false);
            this._domEmitter.removeEventListener('mousedown', this.onmousedown, false);
            this._domEmitter.removeEventListener('mouseup', this.onmouseup, false);
        }

        this._domEmitter = emitter;
        this._domEmitter.addEventListener('contextmenu', this.contextmenu, false);
        this._domEmitter.addEventListener('keydown', this.onkeydown, false);
        this._domEmitter.addEventListener('keyup', this.onkeyup, false);
        this._domEmitter.addEventListener('mousemove', this.onmousemove, false);
        this._domEmitter.addEventListener('mousedown', this.onmousedown, false);
        this._domEmitter.addEventListener('mouseup', this.onmouseup, false);
    }

    constructor(keyMapping: KeyMapping = DEFAULT_CONTROLS, domEmitter: EventTarget = document) {
        super();
        _.forEach(keyMapping, (keyCodes, id) => this.register(id, keyCodes));
        this.domEmitter = domEmitter;
    }

    private contextmenu = (ev: PointerEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    };

    /** keydown **/
    private onkeydown = (ev: KeyboardEvent) => {
        this.emit('keydown', ev.keyCode, ev);
        return _.every(this._bindings, keys => !(ev.keyCode in keys));
    }

    /** keyup **/
    private onkeyup = (ev: KeyboardEvent) => {
        this.emit('keyup', ev.keyCode, ev);
        return _.every(this._bindings, keys => !(ev.keyCode in keys));
    }

    /** mousemove **/
    private onmousemove = (ev: MouseEvent) => {
        this._mouse.x = ev.offsetX;
        this._mouse.y = ev.offsetY;
    };

    /** mousedown **/
    private onmousedown = (ev: MouseEvent) => {
        this.emit('mousedown', ev);
        // console.info('mousedown', ev);
    }

    /** mouseup **/
    private onmouseup = (ev: MouseEvent) => {
        this.emit('mouseup', ev);
        console.info('mouseup', this._mouse);
    }

    register(id: string, keyCodes: number | number[]) {
        this._bindings[id] = new Binding(keyCodes);
    }

    tick() {
        _.forEach(this._bindings, (keys, id) => this._bindings[id].tick());
    }

    get(ctrl: string | number): Binding {
        if (typeof ctrl === 'number') return _.find(this._bindings, (keys, id) => ctrl in keys);
        return this._bindings[ctrl];
    }

    isDown(ctrl: string | number) {
        return this.get(ctrl).isDown;
    }

    isUp(ctrl: string | number) {
        return this.get(ctrl).isUp;
    }

    wasPressed(ctrl: string | number) {
        return this.get(ctrl).wasPressed;
    }

    wasReleased(ctrl: string | number) {
        return this.get(ctrl).wasReleased;
    }
}

export default Input.instance;
