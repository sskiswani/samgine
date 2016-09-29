import { Engine } from "core";
import { EntityManager, Entity, Aspect } from "core/ecs";
import { Transform, Other, Test } from "./components";

const manager = EntityManager.Instance;

let entity = new Entity();
entity.tag = "first entity";
let other = new Entity();
other.tag = "other entity";

let output = document.querySelector("#log");

manager.addAll(entity, other);

let compNames = (ent: Entity) => `<span style="font-family:monospace; font-size:initial;">
    [ ${ent.components.map(c => c ? c.$name : "{null}").join(", ")} ]
</span>`;

const makeElement = (el, opts: { html?: string, text?: string, cls?: string }) => {
    let node = document.createElement(el);
    if (opts.cls) { node.className = opts.cls; }
    if (opts.text) { node.innerText = opts.text; }
    if (opts.html) { node.innerHTML += opts.html; }
    return node;
};

const error = (ent: Entity, aspect: Aspect, text?: string, html?: string) => {

    output.appendChild(makeElement("dt", {
        text: `${text || ent.tag}`,
        html: html,
        cls: "error"
    }));

    output.appendChild(makeElement("dd", {
        html: `Entity: ${compNames(ent)} ${aspect.toString(ent)}`
    }));
};

const success = (ent: Entity, aspect: Aspect, text?: string, html?: string) => {
    output.appendChild(makeElement("dt", {
        text: `${text || ent.tag}`,
        html: `${html || "k"}`,
        cls: "success"
    }));

    output.appendChild(makeElement("dd", {
        html: `Entity: ${compNames(ent)} ${aspect.toString(ent)}`
    }));
}

let TEST = (ent: Entity, aspect: Aspect, expect: boolean) => {
    let msg = `<span style='padding-left:10px; color:#CCC;'>
        expected [ ${expect} ] got [ ${aspect.check(ent)} ]</span>`;

    if (expect === aspect.check(ent)) {
        success(ent, aspect, "SUCCESS", msg);
    } else {
        error(ent, aspect, "ERROR:", msg);
    }
}


let fam = new Aspect([Transform, Other], [Test]);
entity.add(new Transform());
TEST(entity, fam, false);

entity.add(new Other());
TEST(entity, fam, true);

entity.add(new Test());
TEST(entity, fam, false);

fam = new Aspect([], [Test], [Other, Transform]);

entity.remove(Test);
TEST(entity, fam, true);

entity.remove(Other);
TEST(entity, fam, true);

entity.remove(Transform);
TEST(entity, fam, false);


manager.add(entity);

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
