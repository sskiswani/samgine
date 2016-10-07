import Transform from "../components/Transform";
import { Aspect, Entity, EntityManager, EntityObserver } from "../core/ecs";
import { IDictionary } from "core/Types";
import { Keys } from "core/utils";

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

    protected setKey(keyCode: number|string, value: boolean) {
        this._keys[typeof keyCode === "string" ? keyCode : Keys[keyCode]] = value;
    }


    public update() {
        let x = 0, y = 0;
        if (this._keys["A"]) { x -= 1; }
        if (this._keys["D"]) { x += 1; }

        if (this._keys["W"]) { y += 1; }
        if (this._keys["S"]) { y -= 1; }


        this._observer.entities.forEach(entity => {
            let xform = entity.get(Transform);
            xform.position = { x: x + xform.position.x, y: y + xform.position.y };
        });
    }

}