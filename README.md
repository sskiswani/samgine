# samgine
A **work in progress** Typescript game-development bootstrapper (probably more useful as a reference). Clone the repo, run the command `npm install` and start coding with `./src/index.ts`.

**NOTE:** although pixi.js is included, its not hooked up in a convenient way -- thanks to my inability to come up with a good way to make it as convenient as possible.

- `gulp` (defaults to `gulp dev`) for development, which will watch files for changes and update accordingly (manually refreshing the browser)
- `gulp build` to get a complete build of the project in the `./bin` directory.

To get a handle on the important stuff `import { Engine, ECS } from 'core'`.
- `ECS` (`core/ecs`) is a variation on the entity-component theme
  + `ECS.Component` is a decorator that designates a class or object as a component to inject into the system.
    * `ECS.NamedComponent` is the same thing, but accepts an argument to use as a custom name for the component.
  + `ECS.Entity` is the uniquely identifiable collection of components
  + `ECS.EntityManager` keeps track of entities, emits corresponding events
  + `ECS.Aspect` can be used to filter entities based on what components they do and/or don't have.
  + `ECS.EntityObserver` helps keep an update to date collection of entities matching a given aspect.
- `Engine` (`core/Engine`) provides a ['fixed timestep'](http://gafferongames.com/game-physics/fix-your-timestep/) game loop.
  + `engine.on('tick', callback)` will be called at the beginning of every frame.
  + `engine.on('update', callback)` will be called as many times as possible every frame (and at least once).
  + `engine.on('render', callback)` will be called at the end of every frame.
  + `engine.eventStrings` contains the event keys, for autocomplete correctness.

## Examples
### Entities and Components
Registering and adding components simply requires using the `Component` decorator.

```js
import {Component} from "core/ecs";

@Component
export class Position {
    public x: number;
    public y: number;

    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
}

// Create and initialize an entity with this component
let entity = new Entity().add(new Position(50, 50));

// Grab components using their constructor or class name
let log_position = pos => console.info(`Entity @ (${pos.x}, ${pos.y})`);
log_position(entity.get(Position));
log_position(entity.get("position"));

// Strings are case-insensitive though!
log_position(entity.get("PosiTioN"));

// The NamedComponent decorator allows for custom names (as opposed to using their class/type name)
import { NamedComponent } from "core/ecs";

@NamedComponent("pos")
class Position {
    public x: number;
    public y: number;
}

let entity = new Entity().add(new Position());

// et voila!
log_position(entity.get("pos"));
```

### Managing Entities
Entity management happens primarily through the `EntityManager`.

```js
import { Entity, EntityManager } from "core/ecs";

// Create and initialize the entity
let entity = new Entity().add(new Position(50, 50));

// The manager will emit events as entities are modified and is their home.
let manager = EntityManager.Instance;
manager.add(entity);

// Or the quick way...
manager.add(new Entity().add(new Position(50, 50), new Rigidbody()));
```

Use aspects to filter entities based on what components they do and/or don't have.

```js
import { EntityManager, Aspect, ECSEvents } from "core/ecs";

// Looking for entities that have a position and can be rendered, but ignore any rigidbodies.
let allOf = [Position];
let noneOf = ["rigidbody"];
let oneOf = ["sprite", "graphic", "image"];

// Aspects use these three criteria to match entities.
let aspect = Aspect.from(allOf, noneOf, oneOf);

// Aspects are cached based on their criteria, so this wont create a new Aspect
const aspectCopy = Aspect.from(allOf, noneOf, oneOf);

// The purpose of an aspect is to provide easy filtering
let manager = EntityManager.Instance;
let family = manager.entities.filter(entity => aspect.check(entity));

// Now operate on entities knowing they match certain criteria
family.forEach(entity => render({
    position: entity.get("Position"),
    graphic: entity.get("sprite") || entity.get("graphic") || entity.get("image")
}));

// Aspects can be used to help keep a collection of entities up to date.
family.forEach(entity => {
    // Remove entities if they no longer match.
    entity.on(ECSEvents.ENTITY_CHANGED, entity => {
        if(aspect.check(entity) === false) {
            family.splice(family.indexOf(entity), 1);
        }
    });
});

// Check for entities that are dynamically added.
manager.on(ENTITY_ADDED, entity => {
    if(aspect.check(entity)) { family.push(entity); }
});

// Or those that have been removed.
manager.on(ENTITY_REMOVED, entity => {
  family.splice(family.indexOf(entity), 1);
});
```

Reacting to entity modifications can be simplified via `core/ecs/EntityObserver`.

```js
import {Aspect, Entity, EntityManager, EntityObserver} from "core/ecs";
import { Graphic, Transform } from "./components";

const renderAspect = Aspect.from([Graphic, Transform]);

class RenderSystem {
    constructor() {
        // Create an observer for an aspect
        let obs = EntityManager.Instance.register(renderAspect);

        // Respond to new entities
        obs.onEntityInserted(entity => console.info("New entity that matches the renderAspect.", entity));
        obs.onEntityRemoved(entity => console.info("An entity matching renderAspect was removed.", entity));

        // Process entities inserted before the callbacks were registered
        obs.entities.forEach(entity => console.info("Need to prepare an entity", entity));
    }

    public update() {
        // There's also the option of just iterating over the entities collected by the observer
        obs.entities.forEach(entity => {
            let gfx = entity.get(Graphic);
            let xform = entity.get(Transform);

            // Do useful stuff here.
        })

    }
}


```

## TODO
- [x] Query for entities based on components, e.g. `manager.getEntitiesWith(Position, Graphic, Rigidbody);`.
- [x] Get rid of the inflexible `EntityWorld` and `EntitySystem`.
