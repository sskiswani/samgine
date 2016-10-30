import { Component } from "../core/ecs";

type Tile = { id: number }

@Component
export default class Tilemap {
    private _rows: number;
    private _cols: number;
    private _data: Tile[];

    public get rows() { return this._rows; }
    public get columns() { return this._cols; }
    public get data() { return this._data; }

    constructor(rows = 10, cols = 10) {
        this._rows = rows;
        this._cols = cols;
        this._data = new Array<Tile>(this._cols * this._rows);
    }

    public getTile(x: number, y: number) {
        return this._data[y * this._cols + x];
    }

    public setTile(x: number, y: number, tile: Tile) {
        this._data[y * this._cols + x] = tile;
    }
}