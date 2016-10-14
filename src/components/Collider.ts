import { Component } from "../core/ecs";

type Point = {
    x: number;
    y: number;
}

@Component
export default class Collider {
    public offset: Point;
    public extents: number[] = [];

    constructor(width: number, height: number, offset = { x: 0, y: 0 }) {
        this.extents = [width * 0.5, height * 0.5];
        this.offset = offset;
    }

    public get width() { return this.extents[0] * 2; }
    public get height() { return this.extents[1] * 2; }
}