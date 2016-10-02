import { BitSet } from "../lib";
import { getMapping, IComponent } from "./Component";
import { Entity } from "./Entity";
import { IDictionary } from "../Types";

type ComponentType = Function | IComponent | string;

export class Aspect {
    private static _cache: IDictionary<Aspect> = {};

    private _all: number[] = [];
    private _none: number[] = [];
    private _one: number[] = [];
    private _hash: number | string;

    public static from(allOf: ComponentType[] = [], noneOf: ComponentType[] = [], oneOf: ComponentType[] = []) {
        const toIds = comp => (typeof comp === "string" ? getMapping(comp) : <IComponent>comp).$id;

        let all = allOf.map(toIds);
        let none = noneOf.map(toIds);
        let one = oneOf.map(toIds);

        let hash = Aspect.getHash(all, none, one).toString();
        if (Aspect._cache[hash]) { return Aspect._cache[hash]; }

        let aspect = new Aspect(hash);
        aspect._all = all;
        aspect._none = none;
        aspect._one = one;
        return Aspect._cache[hash] = aspect;
    }

    private static getHash(all: number[], none: number[], one: number[]) {
        let toBinary = (arr: number[]) => {
            let set = new BitSet();
            arr.forEach(id => set.set(id));
            return set.toBinaryString();
        };

        let hashString = `${toBinary(all)}${toBinary(none)}${toBinary(one)}`;

        let hash = 0;
        for (let i = 0; i < hashString.length; i++) {
            let char = hashString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return hash;
    }

    public get All() { return this._all; }
    public get None() { return this._none; }
    public get One() { return this._one; }
    public get hash() { return this._hash; }

    private get empty() { return this._all.length === 0 && this._none.length !== 0 && this._one.length === 0; }

    private constructor(hash: string, allOf?: ComponentType[], noneOf?: ComponentType[], oneOf?: ComponentType[]) {
        this._hash = hash;
        if (allOf) { this.allOf(...allOf); }
        if (noneOf) { this.noneOf(...noneOf); }
        if (oneOf) { this.oneOf(...oneOf); }
    }


    private allOf(...components: ComponentType[]) {
        components.forEach(comp => this._all.push((<IComponent>comp).$id));
    }

    private oneOf(...components: ComponentType[]) {
        components.forEach(comp => this._one.push((<IComponent>comp).$id));
    }

    private noneOf(...components: ComponentType[]) {
        components.forEach(comp => this._none.push((<IComponent>comp).$id));
    }

    public allTest(arr: IComponent[]) {
        return this._all.every(id => id in arr);
    }

    public noneTest(arr: IComponent[]) {
        return this._none.every(id => !(id in arr));
    }

    public oneTest(arr: IComponent[]) {
        return (this._one.length === 0 || this._one.some(id => id in arr));
    }

    public check(entity: Entity) {
        let arr = entity.components;
        return this._all.every(id => id in arr)
            && this._none.every(id => !(id in arr))
            && (this._one.length === 0 || this._one.some(id => id in arr));
    }

    public toString(space?: string | number, replacer?: (key: string, value: any) => any) {
        return `[Aspect ${JSON.stringify({
            all: this._all.map(id => getMapping(id).$name),
            none: this._none.map(id => getMapping(id).$name),
            one: this._one.map(id => getMapping(id).$name)
        }, replacer, space)}]`;
    }
}