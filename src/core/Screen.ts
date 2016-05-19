import * as EventEmitter from 'eventemitter3';
import Engine from './Engine';

export interface IScreen {
    show();
    dispose();

    preupdate(dt: number);
    update(dt: number);
    postupdate(dt: number);
    prerender(dt: number);
    render(dt: number);
    postrender(dt: number);
}

export class Screen extends EventEmitter {
    constructor() {
        super();
    }

    preupdate(dt: number) { }
    update(dt: number) { }
    postupdate(dt: number) { }
    prerender(dt: number) { }
    render(dt: number) { }
    postrender(dt: number) { }
}