import "reflect-metadata";
import { IDictionary } from "../Types";

// - - - - - - - - - - - - - - - - - - - - -

export interface IComponent { $name: string; $id: number; }
export type ComponentIdentifier = IComponent | Function | number | string;

const mappingValues: string[] = [];
const compMapping: IDictionary<IComponent> = {};

// - - - - - - - - - - - - - - - - - - - - -

/**
 * Create a mapping for a component so it can be more easily identified.
 */
export function register(ctor: Function, preferredName?: string) {
    let lookupKey: string = (preferredName || (ctor["$name"] || ctor["name"])).toLowerCase();

    Object.freeze(compMapping[lookupKey] = {
        $id: mappingValues.length,
        $name: lookupKey
    });

    mappingValues.push(lookupKey);

    return compMapping[lookupKey];
}

/**
 * Get the mapping for a component given some form of identification
 */
export function getMapping(lookupKey: ComponentIdentifier): IComponent {
    if (typeof lookupKey === "number") {
        return compMapping[mappingValues[lookupKey]];
    } else if (typeof lookupKey === "string") {
        return compMapping[lookupKey.toLowerCase()];
    }

    // Identifier is either a mapping or type
    return compMapping[(lookupKey["$name"] || lookupKey["name"]).toLowerCase()];
}

// - - - - - - - - - - - - - - - - - - - - -

export function Component<T extends Function>(ctor: T): T {
    return NamedComponent(ctor["$name"] || ctor["name"])(ctor);
}

export function NamedComponent(name: string) {
    return function <T extends Function>(ctor: T): T {
        // Force lowercase
        name = name.toLowerCase();

        if (!ctor["$name"]) {
            ctor["$name"] = name;
        } else {
            console.info("NamedComponent:already had a name", ctor);
        }

        // Register the mapping
        let {$name, $id} = register(ctor, name);

        // Assign props to the component so it implements IComponent
        Object.defineProperties(ctor.prototype, {
            $name: { value: $name },
            $id: { value: $id }
        });

        ctor["$id"] = $id;

        // Return to overwrite previous ctor
        return ctor;
    };
}
