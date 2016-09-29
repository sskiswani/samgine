import { Component } from "../core/ecs";

@Component
export class Graphic {
    public alpha = 1;
    public relative = true;
    public tint = 0xffffff;
    public visible = true;
    public z = 0;
    public translate = { x: 0, y: 0 };
    public anchor = { x: 0.5, y: 0.5 };
    public scale = { x: 1, y: 1 };
    public path = "";
}
