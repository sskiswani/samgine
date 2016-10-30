import { Component } from "../core/ecs";

@Component
export default class Transform {
    public position = { x: 0, y: 0 };
    public scale = { x: 0, y: 0 };
    public rotation = 0;

    constructor(args: { position?: { x?: 0, y?: 0 }, scale?: { x?: 0, y?: 0 }, rotation?: 0 } = {}) {
        Object.assign(this, args);
    }
}
