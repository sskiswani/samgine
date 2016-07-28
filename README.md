#samgine
My Typescript game-development bootstrapper. The two important parts you can get to using `import { Engine, ECS } from './core'`
- `ECS` (`./src/core/ecs`) is an entity-component-system that makes use of decorators (no need to manually register components before usage, a requirement of _every_ implementation that I've found thus far).
- `Engine` (`./src/core/Engine`) provides a ['fixed timestep'](http://gafferongames.com/game-physics/fix-your-timestep/) update-render loop.
  - `engine.on('tick', callback)` will be called at the beginning of every frame.
  - `engine.on('update', callback)` will be called as many times as possible every frame (and at least once).
  - `engine.on('render', callback)` will be called at the end of every frame.
- `'src/core/services/Input'` provides a 
  
##Examples

###Entities and Components
Registering and adding components simply requires using the `ComponentMixin` decorator.

```js
import {ComponentMixin} from './src/core/ecs/Component'

@ComponentMixin
export class Position {
    public x:number;
    public y: number;
    
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
}
```
Combining with entity creation and registration becomes:
```js
import { ECS } from './src/core'
import { Position } from './src/your_game/components'

// Create and initialize the entity
const entity = new ECS.Entity().add(new Position(50, 50));

// Entities won't be managed until the world is told to do so
world.insertEntity(entity);

// et voila!
console.info(`An entity at (${entity.Get(Position).x}, ${entity.Get(Position).y})`); 
```

###Entity Systems
```js
import { EntityWorld, EntitySystem, IEntity, RequireComponents } from './src/core/ecs'
import { Position } from './src/your_game/components'

@RequireComponents(Position)
export class MoveEntitySystem extends EntitySystem {
    public pixelsPerSecond = 10;
    
    constructor() {
      super({active: true});
    }
    
    // Is this system interested in the entity?
    interested(entity: IEntity) {
      // leverage the 'aspect' created via the RequireComponents decorator
      return this.aspect.every(componentId => entity.has(componentId));
    }
    
    insert(entity: IEntity) {
      console.info(`Inserted entity with a position component!`, entity.get(Position)); 
    }
    
    remove(entity: IEntity) {
      console.info(`Removed entity with a position component!`, entity.get(Position));
    }
    
    update(dt: number) {
      let pos = entity.get(Position);
      pos.x += pixelsPerSecond * dt;
    }
}
```
Once a system is registered, the `src/core/ecs/EntityWorld` will take care of it.
```js
// Create and register the system to the world.
const entityWorld = new EntityWorld();
entityWorld.registerSystem(new MoveEntitySystem());
```
