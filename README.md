#samgine
A **work in progress** Typescript game-development bootstrapper (probably more useful as a reference). Clone the repo, run the command `npm install` and start coding with `./src/index.ts`.

**NOTE:** although pixi.js is included, its not hooked up in a convenient way -- thanks to my inability to come up with a good way to make it as convenient as possible.

- `gulp` (defaults to `gulp dev`) for development, which will watch files for changes and update accordingly (manually refreshing the browser)
- `gulp build` to get a complete build of the project in the `./bin` directory.

To get a handle on the important stuff `import { Engine, ECS } from 'core'`.
- `ECS` (`core/ecs`) is a variation on the entity-component theme
  + `ECS.Component` is a decorator that designates a class or object as a component to inject into the system.
    * `ECS.NamedComponent` is the same thing, but accepts an argument to use as a custom name for the component.
  + `ECS.Entity` is the uniquely identifiable collection of components
  + `ECS.EntityManager` keeps track of entities, emits corresponding events, and (**TODO**) used to select and query for entities based on the components they have (or lack).
- `Engine` (`core/Engine`) provides a ['fixed timestep'](http://gafferongames.com/game-physics/fix-your-timestep/) game loop.
  + `engine.on('tick', callback)` will be called at the beginning of every frame.
  + `engine.on('update', callback)` will be called as many times as possible every frame (and at least once).
  + `engine.on('render', callback)` will be called at the end of every frame.
  + `engine.eventStrings` contains the event keys, for autocomplete correctness.

## Examples
### Entities and Components
Registering and adding components simply requires using the `Component` decorator.

```js
import {Component} from "core/ecs/Component";

@Component
export class Position {
    public x: number;
    public y: number;

    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
}
```

Combining with entity creation and registration becomes:

```js
import { Entity, EntityManager } from "core/ecs";

// Create and initialize the entity
let entity = new Entity().add(new Position(50, 50));

// Add the entity to the manager to allow querying for entities based on the components they have
let manager = EntityManager.Instance;
manager.add(entity);

// Or the quick way...
manager.add(new Entity()
    .add(new Position(50, 50))
    .add(new Rigidbody())
);

// Grab components using their constructor or the class name
let log_position = pos => console.info(`Entity @ (${pos.x}, ${pos.y})`);
log_position(entity.get(Position));
log_position(entity.get("position"));

// Strings are case-insensitive though!
log_position(entity.get("PosiTioN"));

// The NamedComponent decorator allows for custom component names (as opposed to using their class/type name)
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

## TODO
- [ ] Query for entities based on components, e.g. `manager.getEntitiesWith(Position, Graphic, Rigidbody);`.
- [x] Get rid of the inflexible `EntityWorld` and `EntitySystem`.
