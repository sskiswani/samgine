import { Component } from "../core/ecs";

@Component
export class Transform {
    public position = { x: 0, y: 0 };
    public scale = { x: 0, y: 0 };
    public rotation = 0;

    constructor(args = { position: { x: 0, y: 0 }, scale: { x: 0, y: 0 }, rotation: 0 }) {
        if (args.position) { this.position = args.position; }
        if (args.scale) { this.scale = args.scale; }
        if (args.rotation) { this.rotation = args.rotation; }
    }
}

export const TEST: Transform = {
    position: { x: 0, y: 0 },
    scale: { x: 0, y: 0 },
    rotation: 0
};