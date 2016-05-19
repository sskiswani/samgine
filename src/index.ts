import {ECS, Engine, Utils} from './core'
import RenderSystem from './game/systems/RenderSystem'
import {Graphic, Position} from './game/components'
import Input from './core/services/Input'
// import * as Big from 'big.js'


PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

//~ on load Callback
Engine.on('loaded', () => {
    const world = new ECS.EntityWorld();
    const renderer = new RenderSystem(Engine.renderer, Engine.stage);
    world.registerSystem(renderer);

    //~ Sync input to pixi.renderer view
    Input.domEmitter = renderer.view;

    Input.on('mousedown', (ev: MouseEvent) => {
    });
    // let width = 100;
    // let height = 120;
    // let size = Math.round(height / 2);
    let dimensions;
    let size = 60;
    let height = size * 2;
    let width = Math.sqrt(3) * height / 2;
    let extraX = width - Math.floor(width);

    // height = size * 2;
    // let desiredWidth = Math.sqrt(3) / 2 * height;
    // let dimensions = {height:parseInt(`${height}`), width:parseInt(`${desiredWidth}`)};
    dimensions = { height: height, width: width };
    // console.info('desired', size, dimensions);
    // let scale = new PIXI.Point(desiredWidth / width, 1);

    let names = [
        "cust/Grass/grass_01",
        "cust/Grass/grass_02",
        "cust/Grass/grass_03",
        "cust/Grass/grass_04",
        "cust/Grass/grass_05",
        "cust/Grass/grass_06",
        "cust/Grass/grass_07"
    ];

    //~ Create Entity
    let entity: ECS.Entity;
    let xOffset = size, yOffset = size * 1.5;

    for (let i = 0, n = 0; i < 7; ++i) {
        for (let j = 0; j < 4; ++j, ++n) {
            let {x, y} = offset_to_pixel({ col: i, row: j }, size);
            let gfx = new Graphic((n == 0) ? "cust/Dirt/dirt_06" : `cust/Grass/grass_${Utils.printDigits(n % 19)}`, dimensions.width, dimensions.height);

            entity = new ECS.Entity()
                .add(new Position(x + xOffset + extraX, y + yOffset))
                .add(gfx);
            world.insertEntity(entity);
        }
    }

    //~ Register events
    Engine.on('update', (dt) => world.update(dt));
    Engine.on('render', (dt) => renderer.update(dt));
    Engine.on('tick', Input.tick.bind(Input));

    //~ do it.
    Engine.begin();
    world.initialize();
});

window.onload = () => {
    Engine.init({ pixiArgs: { antialias: true } });
    Engine.load('assets/img/hex_sprites.json');
    document.getElementById('game').appendChild(Engine.view);
};


class Constants {
    static Sqrt3 = Math.sqrt(3);
}
const hexWidth = 120, hexHeight = 140;

class Hex {
    public x = 0;
    public y = 0;
    public z = 0;

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    toPixel() {
        return new PIXI.Point();
    }
}

function offset_to_pixel(hex: { col: number, row: number }, size = 70) {
    return {
        x: size * Constants.Sqrt3 * (hex.col + 0.5 * (hex.row & 1)),
        y: size * 3 / 2 * hex.row + (hex.row * -1)
    }
}

function pixel_to_hex(point = { x: 0, y: 0 }, size = 70) {
    return hex_round({
        q: (point.x * Constants.Sqrt3 / 3 - point.y / 3) / size,
        r: point.y * 2 / 3 / size
    });
}

function hex_to_pixel(hex = { q: 0, r: 0 }, size = 70) {
    return {
        x: size * Constants.Sqrt3 * (hex.q + hex.r / 2),
        y: size * 3 / 2 * hex.r
    }
}

/**
 * cube_round and hex_round take float coordinates instead of int coordinates.
 * If you’ve written a Cube and Hex class, they’ll work fine in dynamically languages
 * where you can pass in floats instead of ints
 */
function hex_round(coords = { q: 0, r: 0 }) {
    return cube_to_hex(cube_round(hex_to_cube(coords)))
}

function cube_to_hex(coords = { x: 0, z: 0 }) { // axial
    return { q: coords.x, r: coords.z };
}

function hex_to_cube(coords = { q: 0, r: 0 }) { // axial
    return { x: coords.q, z: coords.r, y: (-coords.q - coords.r) };
}

function cube_round(h) {
    var rx = Math.round(h.x)
    var ry = Math.round(h.y)
    var rz = Math.round(h.z)

    var x_diff = Math.abs(rx - h.x)
    var y_diff = Math.abs(ry - h.y)
    var z_diff = Math.abs(rz - h.z)

    if (x_diff > y_diff && x_diff > z_diff) {
        rx = -ry - rz;
    }
    else if (y_diff > z_diff) {
        ry = -rx - rz;
    }
    else {
        rz = -rx - ry;
    }

    return { x: rx, y: ry, z: rz };
}
