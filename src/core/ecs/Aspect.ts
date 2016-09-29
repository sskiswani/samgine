import { BitSet } from "../lib";
import { IComponent, getMapping } from "./Component";
import { Entity } from "./Entity";

type ComponentType = Function | IComponent;
type fuckoff = IComponent | string;

export class Aspect {
    private _sall: string[] = [];
    private _snone: string[] = [];
    private _sone: string[] = [];

    // private _all: BitSet = new BitSet();
    // private _none: BitSet = new BitSet();
    // private _one: BitSet = new BitSet();

    private _all: number[] = [];
    private _none: number[] = [];
    private _one: number[] = [];

    public get All() { return; }
    public get None() { return this._none.map(id => getMapping(id).$name); }
    public get One() { return this._one.map(id => getMapping(id).$name); }

    get empty() { return this._all.length === 0 && this._none.length !== 0 && this._one.length === 0; }

    public toString(ent?: Entity) {
        let test = (fn) => ent ? `<td><b>${fn(ent)}</b></td>` : "";
        let names = (arr) => arr.map(id => getMapping(id).$name).join(", ");
        return `<table>
            <tr><td>all</td> ${test(this.allTest.bind(this))}<td>[ ${names(this._all)} ]</td> </tr>
            <tr><td>none</td>  ${test(this.noneTest.bind(this))}<td>[ ${names(this._none)} ]</td> </tr>
            <tr><td>one</td> ${test(this.oneTest.bind(this))} <td>[ ${names(this._one)} ]</td> </tr>
            </table>`;
    }

    public constructor(allOf?: ComponentType[], noneOf?: ComponentType[], oneOf?: ComponentType[]) {
        if (allOf) { this.allOf(...allOf); }
        if (noneOf) { this.noneOf(...noneOf); }
        if (oneOf) { this.oneOf(...oneOf); }
    }

    public allOf(...components: ComponentType[]) {
        components.forEach(comp => this._all.push((<IComponent>comp).$id));
    }

    public oneOf(...components: ComponentType[]) {
        components.forEach(comp => this._one.push((<IComponent>comp).$id));
    }

    public noneOf(...components: ComponentType[]) {
        components.forEach(comp => this._none.push((<IComponent>comp).$id));
    }

    public allTest(ebits: BitSet) {
        return this._all.every(id => ebits.get(id));
    }

    public oneTest(ebits: BitSet) {
        return this._one.length === 0 || this._one.some(id => ebits.get(id));
    }

    public noneTest(ebits: BitSet) {
        return this._none.every(id => !ebits.get(id));
    }

    public check(entity: Entity) {
        let ebits = entity.bits;

        return this._all.every(id => ebits.get(id))
            && this._none.every(id => !ebits.get(id))
            && (this._one.length === 0 || this._one.some(id => ebits.get(id)));
    }
}