import { BitSet } from "../lib";
import { EntityManager } from "./EntityManager";
import { ComponentIdentifier, getMapping, IComponent } from "./Component";
import * as ECSEvents from "./ECSEvents";
import * as EventEmitter from "eventemitter3";
import * as _ from "lodash";

// - - - - - - - - - - - - - - - - - - - - -

export class Entity extends EventEmitter {
    private static _nextId = 0;

    private _guid: string;
    private _id: number;
    private _tag: string;

    private _bitset: BitSet = new BitSet();
    private _comps: IComponent[] = [];

    private _active: boolean = true;

    get guid() { return this._guid; }

    get id() { return this._id; }

    get tag() { return this._tag; }
    set tag(value) {
        let em = EntityManager.Instance;
        if (this._id in em.entities) { em.setTag(this, value); }

        this._tag = value;
    }

    get bits() { return this._bitset; }
    get components() { return this._comps; }

    get active() { return this._active; }
    set active(value: boolean) {
        if (value === this._active) { return; }

        this._active = value;
        this.emit(this.active ? ECSEvents.ENTITY_ENABLED : ECSEvents.ENTITY_DISABLED, this);
    }

    public constructor(tag?: string) {
        super();

        this._guid = _.uniqueId();
        this._id = Entity._nextId++;
        this._tag = tag;
    }

    /**
     * Add a component to this Entity.
     */
    public add(component) {
        let $id = component["$id"];

        this._bitset.set($id);
        this._comps[$id] = component;

        if (this._active) {
            this.emit(ECSEvents.COMPONENT_ADDED, this, component);
            this.emit(ECSEvents.ENTITY_CHANGED, this);
        }

        return this;
    }

    /**
     * Remove a component from this Entity.
     */
    public remove<T extends IComponent>(component: ComponentIdentifier): T {
        let {$name, $id} = getMapping(component);

        console.assert(
            $id in this._comps === this._bitset.get($id),
            `Entity bits and components not synchronized!`,
            this
        );

        let c = this._comps[$id];
        this._bitset.clear($id);
        delete this._comps[$id];

        if (this.active) {
            this.emit(ECSEvents.COMPONENT_REMOVED, this, component, { $id, $name });
            this.emit(ECSEvents.ENTITY_CHANGED, this);
        }

        return c as T;
    }

    /**
     * Get an entity's component.
     */
    public get<T extends IComponent>(comp: ComponentIdentifier): T {
        if (comp["$id"]) { return this._comps[comp["$id"]] as T; }
        if (typeof comp === "number") { return this._comps[comp] as T; }
        return this._comps[getMapping(comp).$id] as T;
    }

    /**
     * Check if an entity has the specified component.
     */
    public has(comp: ComponentIdentifier) {
        if (comp["$id"]) { return this._bitset.get(comp["$id"]); }
        if (typeof comp === "number") { return this._bitset.get(comp); }
        return this._bitset.get(getMapping(comp).$id);
    }

    /**
     * Dispose of this Entity.
     */
    public dispose() {
        Object.keys(this._comps).forEach(key => delete this._comps[key]);

        for (let i = 0; i < this._bitset.length(); ++i) {
            this._bitset.clear(i);
        }

        this.emit(ECSEvents.ENTITY_CHANGED, this);
        this.active = false;
        this.emit(ECSEvents.ENTITY_DISPOSED, this);
    }
}