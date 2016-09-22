export function timestamp(): number {
    return (window.performance && window.performance.now)
        ? window.performance.now()
        : new Date().getTime();
}

export function printDigits(x: number, numDigits = 2): string {
    return x.toLocaleString("en-US", { minimumIntegerDigits: numDigits, useGrouping: false });
}

export function getClassName(obj: Object | Function, lower = true): string {
    let className = (typeof obj === "function") ? obj["name"] : obj.constructor["name"];
    return (lower) ? className.toLowerCase() : className;
}

export function forceArray<T>(val: T | Array<T>): Array<T> {
    return (val instanceof Array) ? val : [val];
}
