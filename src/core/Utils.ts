export function timestamp() {
    return (window.performance && window.performance.now)
        ? window.performance.now()
        : new Date().getTime();
}

export function printDigits(x: number, numDigits = 2) {
    return x.toLocaleString('en-US', { minimumIntegerDigits: numDigits, useGrouping: false });
}

export function getClassName(obj: any, lower = true): string {
    let name = (typeof obj === 'function')
        ? obj['name']
        : obj.constructor['name'];

    // TODO: Testing my faith
    console.assert(!!name || typeof name === 'string' || name !== "",
        "Shieeet getting class name is aids", name, obj);

    return (lower) ? name.toLowerCase() : name;
}

export function forceArray<T>(val: T | Array<T>): Array<T> {
    return (val instanceof Array) ? val : [val];
}

export function proxy(originalObj, originalProp, targetObj, targetProp) {
    Object.defineProperty(originalObj, originalProp, {
        get: () => targetObj[targetProp],
        set: function (newValue) {
            targetObj[targetProp] = newValue;
        }
    });
}

export function readOnlyProxy(originalObj, originalProp, targetObj, targetProp) {
    Object.defineProperty(originalObj, originalProp, {
        get: () => targetObj[targetProp],
        set: (newValue) => {
            console.error(targetProp + ' is read-only.');
            throw new Error('ReadOnly');
        }
    });
}

export function watch(obj, prop, callback: Function, callbackArgs?: any) {
    var value = obj[prop];

    Object.defineProperty(obj, prop, {
        get: () => value,
        set: (newValue) => {
            value = newValue;
            callback(newValue, callbackArgs);
        }
    });
}

export const Key = {
    "SPACEBAR": 32,
    "LEFT": 37,
    "UP": 38,
    "RIGHT": 39,
    "DOWN": 40,
    "0": 48,
    "1": 49,
    "2": 50,
    "3": 51,
    "4": 52,
    "5": 53,
    "6": 54,
    "7": 55,
    "8": 56,
    "9": 57,
    "A": 65,
    "B": 66,
    "C": 67,
    "D": 68,
    "E": 69,
    "F": 70,
    "G": 71,
    "H": 72,
    "I": 73,
    "J": 74,
    "K": 75,
    "L": 76,
    "M": 77,
    "N": 78,
    "O": 79,
    "P": 80,
    "Q": 81,
    "R": 82,
    "S": 83,
    "T": 84,
    "U": 85,
    "V": 86,
    "W": 87,
    "X": 88,
    "Y": 89,
    "Z": 90,
    "PLUS": 187,
    "MINUS": 189,
};