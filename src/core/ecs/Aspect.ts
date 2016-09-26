import { IComponent } from "./";
import { Entity } from "./Entity";
import { BitSet } from "../lib";
import * as EventEmitter from "eventemitter3";

export class Aspect{
    private _all: BitSet = new BitSet();
    private _none: BitSet = new BitSet();
    private _one: BitSet = new BitSet();

    get empty() { return this._all.isEmpty() && this._none.isEmpty() && this._one.isEmpty(); }

    public constructor(allOf?: IComponent[], noneOf?: IComponent[], oneOf?: IComponent[]) {
        if (allOf) { allOf.forEach(comp => this._all.set(comp.$id)); }
        if (noneOf) { noneOf.forEach(comp => this._none.set(comp.$id)); }
        if (oneOf) { oneOf.forEach(comp => this._one.set(comp.$id)); }
    }

    public allOf(...components: IComponent[]) {
        components.forEach(comp => this._all.set(comp.$id));
    }

    public oneOf(...components: IComponent[]) {
        components.forEach(comp => this._one.set(comp.$id));
    }

    public noneOf(...components: IComponent[]) {
        components.forEach(comp => this._none.set(comp.$id));
    }

    public check(entity: Entity) {
        let ebits = entity.bits;
        if (ebits.isEmpty()) { return this.empty; }

        let i = 0;
        for (; i < this._all.length(); ++i) {
            if (!ebits.get(i)) { return false; }
        }

        for (i = 0; i < this._none.length(); ++i) {
            if (ebits.get(i)) { return false; }
        }

        // If there's nothing in the atleast one set, ignore
        if (this._one.isEmpty()) { return true; }

        for (i = 0; i < this._one.length(); ++i) {
            if (ebits.get(i)) { return true; }
        }

        return false;
    }
}