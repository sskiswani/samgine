import { ComponentIdentifier, getMapping, IComponent } from "./Component";
import * as ECSEvents from "./ECSEvents";
import { EntityManager } from "./EntityManager";
import { EventEmitter } from "eventemitter3";
import * as _ from "lodash";

// - - - - - - - - - - - - - - - - - - - - -

export class Entity extends EventEmitter {
    private static _nextId = 0;

    private _guid: string;
    private _id: number;
    private _tag: string;
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
    public add(...components: any[]) {
        components.forEach(component => {
            let $id = component["$id"];

            this._comps[$id] = component;

            if (this._active) {
                this.emit(ECSEvents.COMPONENT_ADDED, this, component);
                this.emit(ECSEvents.ENTITY_CHANGED, this);
            }
        });
        return this;
    }

    /**
     * Remove a component from this Entity.
     */
    public remove<T extends IComponent>(component: {new(): T} | ComponentIdentifier): T {
        let {$name, $id} = getMapping(component);

        let c = this._comps[$id];
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
    public get<T>(comp: {new(): T} | ComponentIdentifier): T {
        if (comp["$id"]) { return this._comps[comp["$id"]] as any as T; }
        if (typeof comp === "number") { return this._comps[comp] as any as T; }
        return this._comps[getMapping(comp).$id] as any as T;
    }

    /**
     * Check if an entity has the specified component.
     */
    public has<T>(comp: {new(): T} | ComponentIdentifier) {
        if (comp["$id"]) { return comp["$id"] in this._comps; }
        if (typeof comp === "number") { return comp in this._comps; }
        return getMapping(comp).$id in this._comps;
    }

    /**
     * Dispose of this Entity.
     */
    public dispose() {
        Object.keys(this._comps).forEach(key => delete this._comps[key]);
        this.active = false;
        this.emit(ECSEvents.ENTITY_DISPOSED, this);
    }
}