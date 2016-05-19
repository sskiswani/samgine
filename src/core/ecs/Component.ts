import * as _ from 'lodash'
import * as EventEmitter from 'eventemitter3'
import "reflect-metadata"

// - - - - - - - - - - - - - - - - - - - - -

export type ComponentIdentifier = IComponent | Function | number | string;

export interface IComponent {
    $name: string;
    $id: number;
}

interface ComponentMapping extends IComponent {
    ctor: Function;
}

interface ComponentMap {
    [$mapping: string]: IComponent;
}

// - - - - - - - - - - - - - - - - - - - - -

export function ComponentMixin<T extends Function>(ctor: T): T {
    let name: string = ctor['$name'] || ctor['name'];
    return NamedComponent(name)(ctor);
}

export function NamedComponent(name: string) {
    return function <T extends Function>(ctor: T): T {
        if (!ctor['$name']) ctor['$name'] = name;
        let mapping = ComponentMapper.register(ctor, name);

        // assign props to the component so it implements IComponent
        Object.defineProperties(ctor.prototype, {
            $name: { value: mapping.$name },
            $id: { value: mapping.$id }
        });

        ctor['$id'] = mapping.$id;

        // return to overwrite prev ctor
        return ctor;
    }
}

// - - - - - - - - - - - - - - - - - - - - -

function _assert(test?: boolean, message?: string, force = false, ...optionalParams: any[]) {
    if (!(force || ComponentMapper.assertions)) return;
    console.assert(test, message, optionalParams);
}

//~ util functions
const isComponent = (thing) => ('$name' in thing || '$id' in thing);
const castToName = (thing: Function | IComponent) => thing['$name'] || thing['name'];

export class ComponentMapper {
    //~ toggles
    public static assertions = true;

    //~ management
    private static _mapping: ComponentMap = {};
    private static _nextId: number = 0;

    static byId(id: number, safe = false) {
        let mapping = _.find(ComponentMapper._mapping, obj => obj.$id === id);
        _assert(mapping !== undefined, "couldnt find id in mapping", safe, id, this);
        return mapping;
    }

    static byConstructor(lookup: Function | IComponent, safe = false): IComponent {
        let key: string = lookup['$name'] || lookup['name'];

        _assert(key in ComponentMapper._mapping,
            `IComponent named ${key} not found!`,
            safe, { lookup, mapper: this }
        );

        return ComponentMapper._mapping[key];
    }

    static getId(lookup: ComponentIdentifier, safe = false): number {
        return ComponentMapper.getMapping(lookup, safe).$id;
    }

    static lookup(lookup: ComponentIdentifier, safe = false): IComponent {
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
    static getMapping(lookup: ComponentIdentifier, safe = false) {
        if (typeof lookup === 'number') {
            let mapping = _.find(ComponentMapper._mapping, obj => obj.$id === lookup);

            _assert(mapping !== undefined,
                `couldnt find id ${lookup} in mapping`,
                safe, { lookup, mapper: this }
            );

            return mapping;
        } else if (typeof lookup === 'string') {

            _assert(lookup in ComponentMapper._mapping,
                `Couldn't find name ${lookup} in mapping`,
                safe, { lookup, mapper: this }
            );

            return ComponentMapper._mapping[lookup];
        }

        let key: string = lookup['$name'] || lookup['name'];

        _assert(key in ComponentMapper._mapping,
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
    static register(ctor: Function, preferredName?: string, safe = true) {
        let lookupKey: string = preferredName || (ctor['$name'] || ctor['name']);

        _assert(
            (lookupKey in ComponentMapper._mapping) === false,
            `Found existing mapping for ${lookupKey}`,
            safe, { ctor, mapper: this }
        );

        Object.freeze(ComponentMapper._mapping[lookupKey] = {
            // ctor: ctor,
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

@ComponentMixin
export class TestComponent {
    static $name = "duuude";

    constructor() {
        // console.log('testcomponent ctor');
    }

    get test() { return 'hello!' }
}

@ComponentMixin
export class OtherComponent {
    constructor() {
        // console.log('other ctor');
    }

    testOther = 'other hello!!'
}
// console.info('test inst', new TestComponent());
// console.info('test type', TestComponent);