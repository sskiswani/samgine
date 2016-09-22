import { BitSet } from "../lib";
import { ComponentIdentifier, IComponent, lookup } from "./Component";
import { EntityWorld } from "./EntityWorld";
import { EventEmitter } from "eventemitter3";
import * as _ from "lodash";

// - - - - - - - - - - - - - - - - - - - - -
//~ Interface
export interface IEntity extends EventEmitter {
    active: boolean;
    tag: string;

    // private members
    id: number;
    guid: string;
    bits: BitSet;
    components: Array<{}>;

    add<T>(component: T): Entity;
    remove<T>(component: ComponentIdentifier): T;

    get<T>(componentIdentifier: ComponentIdentifier): T;
    has(comp: ComponentIdentifier | number);

    attach(id: number, world: EntityWorld);
    detach();

    reset();
}

// - - - - - - - - - - - - - - - - - - - - -
//~ Implementation
export class Entity extends EventEmitter implements IEntity {
    public tag: string = "";
    private _active: boolean = true;
    private _id: number = -1;
    private _guid: string;
    private _bitset: BitSet = new BitSet();
    private _comps: IComponent[] = [];

    get components() { return this._comps; }
    get bits() { return this._bitset; }
    get id() { return this._id; }
    get guid() { return this._guid; }

    get active() { return this._active; }
    set active(value: boolean) {
        if (value === this._active) { return; }

        this._active = value;
        this.emit(this.active ? "actived" : "deactivated", this);
    }

    public constructor() {
        super();
        this._guid = _.uniqueId();
    }

    public attach(id: number, world: EntityWorld) {
        if (this._id > -1) { return; }
        return this._id = id;
    }

    public detach() {
        this.emit("detached", this);
        this.removeAllListeners();
    }

    public add<T extends IComponent>(component: T) {
        let {$id} = component;

        this._bitset.set($id);
        this._comps[$id] = component;

        if (this.active) {
            this.emit("added", this, component);
            this.emit("changed", this);
        }

        return this;
    }

    public remove<T extends IComponent>(component: ComponentIdentifier): T {
        let {$id, $name} = lookup(component);

        console.assert(
            $id in this._comps === this._bitset.get($id),
            `Entity bits and components not synchronized!!`,
            this
        );

        let c = this._comps[$id];
        this._bitset.clear($id);
        delete this._comps[$id];

        if (this.active) {
            this.emit("removed", this, component, { $id, $name });
            this.emit("changed", this);
        }

        return c as T;
    }

    public get<T extends IComponent>(comp: ComponentIdentifier): T {
        return (this._comps[(typeof comp === "number") ? comp : lookup(comp).$id]) as T;
    }

    public has(comp: ComponentIdentifier) {
        return this._bitset.get(typeof comp === "number" ? comp : lookup(comp).$id);
    }

    public reset() {
        this.emit("destroyed", this);

        _.keys(this._comps).forEach(key => delete this._comps[key]);

        for (let i = 0; i < this._bitset.length(); ++i) {
            this._bitset.clear(i);
        }

        this.emit("changed", this);
    }
}
