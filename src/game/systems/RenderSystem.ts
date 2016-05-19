import * as _ from 'lodash';
import {EntitySystem, IEntity, RequireComponents} from '../../core/ecs';
import {PIXIRenderer, NumericDictionary} from '../../core/Types'
import {proxy} from '../../core/Utils'
import {Graphic, Position} from '../components'
import Input from '../../core/services/Input'

interface EntityCollection {
    graphic: Graphic,
    display: PIXI.Sprite,
    position: Position;
}

export enum RoundingMethod {
    None,
    Round,
    Floor,
    Ceil
};

const IdentityMethod = x => x;

@RequireComponents(Graphic, Position)
export default class RenderSystem extends EntitySystem {
    static get PositionRoundingType() { return RenderSystem._internalType; }

    static set PositionRoundingType(type) {
        RenderSystem._internalType = type;

        if (type === RoundingMethod.None) RenderSystem._round = IdentityMethod;
        if (type === RoundingMethod.Round) RenderSystem._round = Math.round;
        if (type === RoundingMethod.Ceil) RenderSystem._round = Math.ceil;
        if (type === RoundingMethod.Floor) RenderSystem._round = Math.floor;
    }

    private static _internalType = RoundingMethod.Ceil;
    private static _round = Math.ceil;

    static aspect: number[];

    private _renderer: PIXIRenderer;
    private _stage: PIXI.Container;
    private _camera: PIXI.Container = new PIXI.Container();
    private _graphics: EntityCollection[] = [];

    get renderer() { return this._renderer; }
    get stage() { return this._stage; }
    get view() { return this._renderer.view; }

    constructor(renderer: PIXIRenderer, stage = new PIXI.Container()) {
        super({ active: false });
        this._renderer = renderer;
        this._stage = stage;
        this._camera.interactive = this._stage.interactive = true;
        this._stage.addChild(this._camera);
    }

    insert(entity: IEntity) {
        let gid = Graphic['$id'], pid = Position['$id'];
        let gfx = entity.get<Graphic>(gid);

        this._graphics[entity.id] = {
            get graphic() { return entity.get<Graphic>(gid) },
            get position() { return entity.get<Position>(pid) },
            display: (gfx.fromFrame) ? PIXI.Sprite.fromFrame(gfx.path)
                : PIXI.Sprite.fromImage(gfx.path),
        };

        let display = this._graphics[entity.id].display;

        Input.on('mousedown', (ev: MouseEvent) => {
            if (display.getBounds().contains(ev.offsetX, ev.offsetY)) {
                console.info('ay bb', {
                    handle: this._graphics[entity.id],
                    entity: entity,
                    local: display.toLocal(Input.mouse),
                    camera: this._camera.toLocal(Input.mouse)
                });
            }
        });

        ['alpha', 'anchor', 'scale', 'tint', 'visible', 'z', 'width', 'height'].forEach(prop => {
            this._graphics[entity.id].display[prop] = gfx[prop];
            proxy(entity.components[gid], prop, this._graphics[entity.id].display, prop);
        });

        // register to camera
        this._camera.addChild(this._graphics[entity.id].display);
    }

    remove(entity: IEntity) {
        this._camera.removeChild(this._graphics[entity.id].display);
        delete this._graphics[entity.id];
    }

    update(dt: number) {
        _.forEach(this._graphics, ({graphic, position, display}, euid) => {
            let {x, y} = graphic.translate;

            if (graphic.relative) {
                x += position.x;
                y += position.y;
            }

            display.position.set(RenderSystem._round(x), RenderSystem._round(y));
        });

        this._renderer.render(this._stage);
    }

    interested(e: IEntity) {
        return RenderSystem.aspect.every(cid => e.has(cid));
    }
}