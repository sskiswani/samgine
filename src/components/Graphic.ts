import { Component } from "../core/ecs";
import { Point } from "pixi.js";

@Component
export default class Graphic {
    // public alpha = 1;
    // public relative = true;
    // public tint = 0xffffff;
    // public visible = true;
    // public z = 0;
    // public translate = { x: 0, y: 0 };
    public anchor = new Point(0, 1);
    public scale = { x: 1, y: 1 };
    public path = "";

    public constructor(args?: Graphic | any) {
        this.path = args.path || "";
    }
}
