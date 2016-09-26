import { Entity } from "./Entity";
import { BitSet } from "../lib";

export class Aspect {
    private _all: BitSet = new BitSet();
    private _none: BitSet = new BitSet();
    private _one: BitSet = new BitSet();

    get empty() { return this._all.isEmpty() && this._none.isEmpty() && this._one.isEmpty(); }

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