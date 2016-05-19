import * as _ from 'lodash'
// import * as EventEmitter from 'eventemitter3'
import {getClassName} from '../Utils'
import {BitSet} from '../lib'
import {IEntitySystem} from './EntitySystem'
import {IEntity} from './Entity'

// - - - - - - - - - - - - - - - - - - - - -

interface Mapping {
    [$key: string]: number
}

// - - - - - - - - - - - - - - - - - - - - -

function PropertyDecorator(target: Object, propertyKey: string | symbol) {
    console.log("PropertyDecorator called on: ", target, propertyKey);
}

// - - - - - - - - - - - - - - - - - - - - -

export class EntityWorld {
    private _entityMap: Mapping = {};
    private _systemMap: Mapping = {};

    private _systems: IEntitySystem[] = [];
    private _entities: IEntity[] = [];

    private _initialized: boolean = false;

    get entities() { return this._entities; }
    get systems() { return this._systems; }

    constructor() {

    }

    initialize() {
        this._initialized = true;
        this._entities.forEach(this.insertEntity, this);
        this._systems.sort((a, b) => a.priority - b.priority);
    }

    update(dt: number = -1) {
        if (!this._initialized) return;

        this._systems.forEach((system) => {
            if (system.isActive) {
                system.preupdate(dt);
                system.update(dt);
                system.postupdate(dt);
            }
        });
    }

    // - - - - - - - - - - - - - - - - - - - - -
    //~ System Management
    private _notifySystems(entity: IEntity) {
        this._systems.forEach((system) => {
            if (system.entities.get(entity.id)) {
                if (!system.interested(entity))
                    system.remove(entity);
                return;
            } else {
                if (system.interested(entity))
                    system.insert(entity);
            }
        });
    }

    registerSystem(system: IEntitySystem) {
        this._systemMap[getClassName(system)] = this._systems.length;
        this._systems.push(system);
        system.attached(this);

        if (this._initialized) {
            this._systems.sort((a, b) => a.priority - b.priority);
        }
    }

    detachSystem(system: IEntitySystem | string) {
        let key: string = _.isString(system) ? system : getClassName(system);
        let index: number = this._systemMap[key];

        delete this._systemMap[key];
        let sys = this._systems.splice(index, 1)[0];
        sys.detached();

        if (this._initialized) {
            this._systems.sort((a, b) => a.priority - b.priority);
        }
    }

    // - - - - - - - - - - - - - - - - - - - - -
    //~ Entity Management
    insertEntity(entity: IEntity) {
        entity.attach(this._entities.length, this);
        this._entities.push(entity);

        entity.on('change', this._notifySystems.bind(this));

        if (!this._initialized) return;
        this._notifySystems(entity);
    }

    getEntity(identifier: number | string): IEntity {
        if (_.isNumber(identifier)) {
            return this._entities[identifier];
        } else if (_.isString(identifier)) {
            return this._entities[this._entityMap[identifier]];
        }

        console.assert(false, 'shouldnt get here', identifier);
    }

    destroyEntity(entity: IEntity | number | string) {
        let e: IEntity;

        if (_.isNumber(entity)) {
            e = this._entities[entity];
        } else if (_.isString(entity)) {
            e = this._entities[this._entityMap[entity]];
        } else if ('id' in entity) {
            e = this._entities[entity.id];
        } else {
            console.assert(false, 'shouldnt get here', entity);
        }

        e.reset();
        delete this._entityMap[e.guid];
        this._entities.splice(e.id, 1);
        this._systems.forEach(system => system.remove(e));
        return e;
    }

}