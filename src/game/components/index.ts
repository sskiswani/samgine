import * as _ from 'lodash'
import {ComponentMixin} from '../../core/ecs/Component'

@ComponentMixin
export class Position {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

@ComponentMixin
export class Graphic {
    private static _defaults = {
        alpha: 1,
        tint: 0xffffff,
        z: 0,
        relative: true,
        visible: true,
        anchor: new PIXI.Point(0.5, 0.5),
        scale: new PIXI.Point(1, 1),
        translate: new PIXI.Point(),
    };

    fromFrame = true;
    alpha = 1;
    tint = 0xffffff;
    z = 0;
    relative = true;
    visible = true;
    anchor = new PIXI.Point(0.5, 0.5);
    scale = new PIXI.Point(1, 1);
    translate = new PIXI.Point();
    path: string;
    width;
    height;

    constructor(path:string, width?:number, height?:number) {
        this.path = path;
        this.width = width;
        this.height = height;
    }

    assign(values: {}) {
        Object.getOwnPropertyNames(Graphic._defaults).forEach(name => {
            this[name] = values[name];
        });
    }
}