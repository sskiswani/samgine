import { Aspect } from "./Aspect";
import * as Events from "./ECSEvents";
import { Entity } from "./Entity";
import { EntityManager } from "./EntityManager";
import * as EventEmitter from "eventemitter3";

export class EntityObserver extends EventEmitter {
    public static readonly REMOVED = "removed";
    public static readonly INSERTED = "inserted";

    public readonly aspect: Aspect;
    private _ids: number[] = [];
    private getEntity: (number) => Entity;

    public get entities() { return this._ids.map(this.getEntity); }

    public constructor(manager: EntityManager, aspect: Aspect) {
        super();

        this.aspect = aspect;
        this.getEntity = manager.get;

        // Add callbacks
        const changeCallback = this.onEntityChange.bind(this);

        manager.on(Events.ENTITY_ADDED, entity => {
            entity.on(Events.ENTITY_CHANGED, changeCallback);
        });

        manager.on(Events.ENTITY_REMOVED, entity => {
            this.remove(entity);
            entity.removeListener(Events.ENTITY_CHANGED, changeCallback);
        });

        // Process existing entities
        manager.entities.forEach(entity => {
            entity.on(Events.ENTITY_CHANGED, changeCallback);
            changeCallback(entity);
        });
    }

    public onEntityRemoved(cb: (e?: Entity) => void) {
        this.addListener(EntityObserver.REMOVED, cb);
    }

    public onEntityInserted(cb: (e?: Entity) => void) {
        this.addListener(EntityObserver.INSERTED, cb);
    }

    protected remove(entity: Entity) {
        let idx = this._ids.indexOf(entity.id);
        if (idx === -1) { return; }

        this._ids.splice(idx, 1);
        this.emit(EntityObserver.REMOVED, entity);
    }

    protected add(entity: Entity) {
        if (this._ids.indexOf(entity.id) !== -1) { return; }

        this._ids.push(entity.id);
        this.emit(EntityObserver.INSERTED, entity);
    }

    protected onEntityChange(entity) {
        if (this.aspect.check(entity)) {
            this.add(entity);
        } else {
            this.remove(entity);
        }
    }

    public forEach(cb: (entity) => void) {
        this._ids.forEach(id => cb(this.getEntity(id)));
    }
}
