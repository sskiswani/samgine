import { BitSet } from "../lib";
import { IEntity } from "./Entity";
import { EntityWorld } from "./EntityWorld";
import * as EventEmitter from "eventemitter3";

/**
 * Decorator that allows specifying components as required for a system.
 * @export
 * @param {...Function[]} args
 * @returns
 */
export function RequireComponents(...args: Function[]) {
    return function <T extends typeof EntitySystem>(ctor: T): T {
        let aspect = [];

        args.forEach(ctype => {
            if ("$id" in ctype.prototype) {
                aspect.push(ctype.prototype.$id["$id"]);
            }
        });

        ctor["aspect"] = aspect;

        // return to overwrite prev ctor
        return ctor;
    };
}

export interface IEntitySystem {
    isActive: boolean;
    priority: number;
    entities: BitSet;

    preupdate(dt: number);
    update(dt: number);
    postupdate(dt: number);

    interested(entity: IEntity): boolean;

    attached(world: EntityWorld);
    detached();

    insert(entity: IEntity): void;
    remove(entity: IEntity): void;
}

export class EntitySystem extends EventEmitter implements IEntitySystem {
    public isActive: boolean = true;

    private _entities: BitSet = new BitSet();
    private _priority: number;

    public constructor({priority = 0, active = true} = {}) {
        super();
        this._priority = priority;
        this.isActive = active;
    }

    //~ Abstract methods
    public preupdate(dt: number) { }
    public update(dt: number) { }
    public postupdate(dt: number) { }
    public attached(world: EntityWorld) { }
    public detached() { }

    public interested(entity: IEntity) { return false; }

    public insert(entity: IEntity) { this._entities.set(entity.id); }
    public remove(entity: IEntity) { this._entities.clear(entity.id); }

    public get priority() { return this._priority; }
    public get entities() { return this._entities; }
}