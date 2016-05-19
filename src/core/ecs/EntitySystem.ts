import * as _ from 'lodash'
import * as EventEmitter from 'eventemitter3'
import {BitSet} from '../lib'
import {IEventEmitter} from '../Types'
import {IEntity} from './Entity'
import {EntityWorld} from './EntityWorld'

// - - - - - - - - - - - - - - - - - - - - -

export function RequireComponents(...args: Function[]) {
    return function <T extends typeof EntitySystem>(ctor: T): T {
        let aspect = [];

        args.forEach(ctype => {
            if ('$id' in ctype.prototype)
                aspect.push(ctype.prototype['$id']);
        });

        ctor['aspect'] = aspect;

        // return to overwrite prev ctor
        return ctor;
    }
}

// - - - - - - - - - - - - - - - - - - - - -

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

// - - - - - - - - - - - - - - - - - - - - -

export class EntitySystem extends EventEmitter implements IEntitySystem {
    isActive = true;

    private _entities = new BitSet();
    private _priority;

    constructor({priority = 0, active = true} = {}) {
        super();
        this._priority = priority;
        this.isActive = active;
    }

    //~ Abstract methods
    preupdate(dt: number) { }
    update(dt: number) { }
    postupdate(dt: number) { }
    attached(world: EntityWorld) { }
    detached() { }

    interested(entity: IEntity) {
        return false;
    }

    insert(entity: IEntity) {
        this._entities.set(entity.id);
    }

    remove(entity: IEntity) {
        this._entities.clear(entity.id);
    }


    get priority() {
        return this._priority;
    }

    get entities() {
        return this._entities;
    }
}