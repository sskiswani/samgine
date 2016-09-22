export interface IDictionary<T> { [index: string]: T; }

export interface IIndex<T> { [index: number]: T; }

export interface IList<T> {
    [index: number]: T;
    length: number;
}
