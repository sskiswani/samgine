import { IDictionary } from '../Types';

type Point = { x: number, y: number }
export default class SpatialHash<T> {
    public readonly binSize: number;
    protected _bins: IDictionary<T[]> = {};

    constructor(binSize: number = 50) {
        this.binSize = binSize;
    }


    public query(p: Point): T[] {
        return [];
    }
}