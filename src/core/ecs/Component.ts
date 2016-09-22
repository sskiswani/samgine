import * as _ from "lodash";
import { EventEmitter } from "eventemitter3";
import "reflect-metadata";


const C_NAME = Symbol("$name");
const C_ID = Symbol("$id");

// - - - - - - - - - - - - - - - - - - - - -

export type ComponentIdentifier = IComponent | Function | number | string;

export interface IComponent {
    $name: string;
    $id: number;
}

interface IComponentMapping extends IComponent { ctor: Function; }
interface IComponentMap { [$mapping: string]: IComponent; }

// - - - - - - - - - - - - - - - - - - - - -

export function ComponentMixin<T extends Function>(ctor: T): T {
    let name: string = ctor[C_NAME];
    return NamedComponent(name)(ctor);
}

export function NamedComponent(name: string) {
    return function <T extends Function>(ctor: T): T {
        if (!ctor[C_NAME]) { ctor[C_NAME] = name; }
        let mapping = ComponentMapper.register(ctor, name);

        // assign props to the component so it implements IComponent
        Object.defineProperties(ctor.prototype, {
            $name: { value: mapping.$name },
            $id: { value: mapping.$id }
        });

        ctor[C_ID] = mapping.$id;

        // return to overwrite prev ctor
        return ctor;
    };
}

// - - - - - - - - - - - - - - - - - - - - -

function _assert(
    test?: boolean, message?: string, force = false, ...optionalParams: Object[]) {
    if (!(force || ComponentMapper.assertions)) { return; }
    console.assert(test, message, optionalParams);
}

export class ComponentMapper {
    //~ toggles
    public static assertions = true;

    //~ management
    private static _mapping: IComponentMap = {};
    private static _nextId: number = 0;

    public static byId(id: number, safe = false) {
        let mapping = _.find(ComponentMapper._mapping, obj => obj.$id === id);
        _assert(
            mapping !== undefined, "couldnt find id in mapping", safe, id, this);
        return mapping;
    }

    public static byConstructor(lookup: Function | IComponent, safe = false): IComponent {
        let key: string = typeof lookup === "function" ? lookup.name : lookup.$name;

        _assert(
            key in ComponentMapper._mapping,
            `IComponent named ${key} not found!`,
            safe, { lookup, mapper: this }
        );

        return ComponentMapper._mapping[key];
    }

    public static getId(lookup: ComponentIdentifier, safe = false): number {
        return ComponentMapper.getMapping(lookup, safe).$id;
    }

    public static lookup(lookup: ComponentIdentifier, safe = false): IComponent {
        let { $id, $name } = ComponentMapper.getMapping(lookup, safe);
        return { $id, $name };
    }

    /**
     * Get the mapping for a component given some identifying value
     *
     * @static
     * @param {ComponentIdentifier} obj (description)
     * @param {boolean} [safe=false] (description)
     * @returns (description)
     */
    public static getMapping(lookup: ComponentIdentifier, safe = false) {
        if (typeof lookup === "number") {
            let mapping = _.find(ComponentMapper._mapping, obj => obj.$id === lookup);

            _assert(
                mapping !== undefined,
                `couldnt find id ${lookup} in mapping`,
                safe, { lookup, mapper: this }
            );

            return mapping;
        } else if (typeof lookup === "string") {

            _assert(
                lookup in ComponentMapper._mapping,
                `Couldn't find name ${lookup} in mapping`,
                safe, { lookup, mapper: this }
            );

            return ComponentMapper._mapping[lookup];
        }

        let key: string = typeof lookup === "function" ? lookup.name : lookup[C_NAME];

        _assert(
            key in ComponentMapper._mapping,
            `IComponent named ${key} not found!`,
            safe, { lookup, mapper: this }
        );

        return ComponentMapper._mapping[key];
    }

    /**
     * (description)
     *
     * @static
     * @param {Function} ctor (description)
     * @returns (description)
     */
    public static register(ctor: Function, preferredName?: string, safe = true) {
        let lookupKey: string = preferredName || (ctor[C_NAME] || ctor["name"]);

        _assert(
            (lookupKey in ComponentMapper._mapping) === false,
            `Found existing mapping for ${lookupKey}`,
            safe, { ctor, mapper: this }
        );

        Object.freeze(ComponentMapper._mapping[lookupKey] = {
            $id: ComponentMapper._nextId++,
            $name: lookupKey
        });

        return ComponentMapper._mapping[lookupKey];
    }
}

//~ Convenience exports
export function register(ctor: Function, preferredName?: string, safe = true) {
    ComponentMapper.register(ctor, preferredName, safe);
}

export function getMappinggetMapping(lookup: ComponentIdentifier, safe = false) {
    return ComponentMapper.getMapping(lookup, safe);
}

export function lookup(lookup: ComponentIdentifier, safe = false): IComponent {
    return ComponentMapper.lookup(lookup, safe);
};
