import Transform from "../components/Transform";
import { Aspect, EntityManager, EntityObserver } from "../core/ecs";
import { IDictionary } from "core/types";
import { Keys } from "core/utils";

import Engine from "core/Engine";

const inputAspect = Aspect.from([Transform]);
export default class InputSystem {
    private _observer: EntityObserver;
    private _keys: IDictionary<boolean> = {};

    constructor() {
        let obs = EntityManager.Instance.register(inputAspect);
        this._observer = obs;

        document.onkeydown = ev => this.setKey(ev.keyCode || ev.which, true);
        document.onkeyup = ev => this.setKey(ev.keyCode || ev.which, false);
    }

    protected setKey(keyCode: number, value: boolean) {
        this._keys[Keys[keyCode]] = value;
    }


    public update() {
        const stage = Engine.stage;
        let x = 0, y = 0;

        if (this._keys["A"]) { x -= 3; }
        else if (this._keys["D"]) { x += 3; }
        if (this._keys["W"]) { y += 3; }
        else if (this._keys["S"]) { y -= 3; }

        if (this._keys["LEFT"]) { stage.x += 3; }
        else if (this._keys["RIGHT"]) { stage.x -= 3; }
        if (this._keys["UP"]) { stage.y += 3; }
        else if (this._keys["DOWN"]) { stage.y -= 3; }


        this._observer.entities.forEach(entity => {
            let xform = entity.get<Transform>(Transform);
            xform.position = { x: x + xform.position.x, y: y + xform.position.y };
        });
    }
}