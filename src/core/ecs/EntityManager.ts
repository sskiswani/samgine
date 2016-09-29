import { EntityObserver } from "./EntityObserver";
import { IDictionary, IIndex } from "../Types";
import { Aspect } from "./Aspect";
import * as Events from "./ECSEvents";
import { Entity } from "./Entity";
import * as EventEmitter from "eventemitter3";


export class EntityManager extends EventEmitter {
    private static _instance = new EntityManager();

    public static get Instance(): EntityManager { return EntityManager._instance; }

    private _observers = {};
    private _entities: IIndex<Entity> = [];
    private _tags: IDictionary<number> = {};

    public get entities(): IIndex<Entity> { return this._entities; }

    //"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

    private constructor() {
        super();
        if (EntityManager._instance === null) {
            EntityManager._instance = this;
        }
    }

    public register(aspect: Aspect) {
        return this._observers[aspect.hash] = new EntityObserver(this, aspect);
    }

    /** Add an entity to be managed. */
    public add(entity: Entity): number {
        let {id, tag} = entity;

        // If the entity has already been added, don't bother.
        if (this._entities[id]) { return; }

        this._entities[id] = entity;
        if (tag) { this._tags[tag] = id; }

        this.emit(Events.ENTITY_ADDED, entity);

        return id;
    }

    /** Add multiple entities to be managed. */
    public addAll(...entities: Entity[]): void {
        entities.forEach(e => this.add(e));
    }

    /** Remove a managed entity. */
    public remove(entity: string | number | Entity): Entity {
        let id: number, tag: string;

        if (typeof entity === "string") {
            tag = entity;
            id = this._tags[tag];
            entity = this._entities[id];
        } else if (typeof entity === "number") {
            id = entity;
            entity = this._entities[id];
            tag = entity.tag;
        } else {
            id = entity.id;
            tag = entity.tag;
        }

        if (tag) { delete this._tags[tag]; }
        entity = this._entities[id];
        delete this._entities[id];

        this.emit(Events.ENTITY_REMOVED, entity);
        return entity;
    }

    /** Remove multiple entities */
    public removeAll(...entities: Array<string | number | Entity>): Entity[] {
        return entities.map(e => this.remove(e));
    }

    public get(ident: string | number): Entity {
        if (typeof ident === "string") { ident = this._tags[ident]; }
        return this._entities[ident];
    }

    public getAll(...identifiers: Array<string | number>): Entity[] {
        return identifiers.map(e => this.get(e));
    }

    public setTag(entity: Entity, newTag?: string, verifyIntegrity = false) {
        let {id, tag} = entity;

        if (verifyIntegrity) {
            _.forIn(this._tags, (value, key, object) => {
                if (value !== id) { return; }
                delete this._tags[key];
            });
        }

        delete this._tags[tag];

        if (!newTag) { return; }
        this._tags[newTag] = id;
    }
}
