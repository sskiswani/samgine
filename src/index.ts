import { Engine } from "core";
import { EntityManager, Entity, Aspect } from "core/ecs";
import { Transform, Other, Test } from "./components";

const manager = EntityManager.Instance;

let entity = new Entity();
let other = new Entity();
entity.tag = "first entity";
other.tag = "other entity";

let output = document.querySelector("#log");
manager.addAll(entity, other);

entity.add(new Transform(), new Other());
other.add(new Other());

let fam = Aspect.from(["Transform", "Other"], ["Test"]);
console.assert(fam.check(entity), "entity");
console.assert(!fam.check(other), "other");

fam = Aspect.from(["Other"], [], ["Transform"]);
console.assert(fam.check(entity), `entity: [ ${entity.components.map(c => c.$name).join(", ")} ] vs: ${fam}`);
console.assert(!fam.check(other), `other: [ ${other.components.map(c => c.$name).join(", ")} ] vs: ${fam}`);

other.add(new Test());
fam = Aspect.from([], [Test], ["OTHER", "Transform"]);
console.assert(fam.check(entity), `entity: [ ${entity.components.map(c => c.$name).join(", ")} ] vs: ${fam}`);
console.assert(!fam.check(other), `other: [ ${other.components.map(c => c.$name).join(", ")} ] vs: ${fam}`);

fam = Aspect.from([Other], [], [Test]);
console.assert(!fam.check(entity), `entity: [ ${entity.components.map(c => c.$name).join(", ")} ] vs: ${fam}`);
console.assert(fam.check(other), `other: [ ${other.components.map(c => c.$name).join(", ")} ] vs: ${fam}`);

fam = Aspect.from([Transform, Other], [Test]);
fam = Aspect.from([Transform, Other], [Test]);
fam = Aspect.from([Transform, Other], [Test]);


// on load callback
Engine.on("loaded", () => {

    Engine.on("tick", fps => {
        // TODO
    });

    Engine.on("update", deltaTime => {
        // TODO
    });

    Engine.on("render", deltaTime => {
        Engine.renderer.render(Engine.stage);
    });

    Engine.begin();
});

window.onload = () => {
    Engine.init({ pixiArgs: { antialias: true, backgroundColor: 0x000 } });
    Engine.load("sprites.json");
    document.getElementById("game").appendChild(Engine.view);
};
