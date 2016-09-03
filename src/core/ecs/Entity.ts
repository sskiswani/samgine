import * as _ from 'lodash'
import * as EventEmitter from 'eventemitter3'
import { BitSet } from '../lib'
import { IEventEmitter } from '../Types'
import { IComponent, ComponentIdentifier, register, lookup } from './Component'
import { EntityWorld } from './EntityWorld'

// - - - - - - - - - - - - - - - - - - - - -
//~ Interface
export interface IEntity extends IEventEmitter {
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
    tag = "";

    private _active = true;
    private _id: number = -1;
    private _guid: string;
    private _bitset: BitSet = new BitSet();
    private _comps = [];

    get components() { return this._comps; }
    get bits() { return this._bitset; }
    get id() { return this._id; }
    get guid() { return this._guid; }

    get active() { return this._active; }
    set active(value) {
        if (value === this._active) return;

        this._active = value;
        this.emit(this.active ? 'actived' : 'deactivated', this);
    }

    constructor() {
        super();
        this._guid = _.uniqueId();
    }

    attach(id: number, world: EntityWorld) {
        if (this._id > -1) return;
        return this._id = id;
    }

    detach() {
        this.emit('detached', this);
        this.removeAllListeners();
    }

    add(component) {
        let {$id} = component;

        this._bitset.set($id);
        this._comps[$id] = component;

        if (this.active) {
            this.emit('added', this, component);
            this.emit('changed', this);
        }

        return this;
    }

    remove<T>(component: ComponentIdentifier): T {
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
            this.emit('removed', this, component, { $id, $name });
            this.emit('changed', this);
        }

        return c;
    }

    get<T>(comp: ComponentIdentifier): T {
        return this._comps[(typeof comp === 'number') ? comp : lookup(comp).$id];
    }

    has(comp: ComponentIdentifier) {
        return this._bitset.get(typeof comp === 'number' ? comp : lookup(comp).$id);
    }

    reset() {
        this.emit('destroyed', this);

        _.keys(this._comps)
            .forEach((key) => delete this._comps[key])

        for (let i = 0; i < this._bitset.length(); ++i)
            this._bitset.clear(i);

        this.emit('changed', this);
    }
}
