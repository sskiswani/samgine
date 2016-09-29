import { Component } from "../core/ecs";

@Component
export class Transform {
    public position = { x: 0, y: 0 };
    public scale = { x: 0, y: 0 };
    public rotation = 0;
}

export const TEST: Transform = {
    position: { x: 0, y: 0 },
    scale: { x: 0, y: 0 },
    rotation: 0
};