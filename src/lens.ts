// https://gist.github.com/mitaki28/ad39a69ab4fa73c99a822c0c3abc99dd

export abstract class Lens<T, U> {
    abstract get: (obj: T) => U;
    abstract set: (value: U) => (obj: T) => T;
    then = <V>(lens: Lens<U, V>) => new ComposedLens(this, lens);
    thenKey = <L extends keyof U>(key: L): Lens<T, U[L]> => this.then(new ObjectLens<U, L>(key));
    modify = (f: (value: U) => U) => (obj: T) => this.set(f(this.get(obj)))(obj);
}

export class IdLens<T> extends Lens<T, T> {
    get = (obj: T) => obj;
    set = (value: T) => (obj: T) => value;
}

export class ComposedLens<T, U, V> extends Lens<T, V> {
    constructor(private a: Lens<T, U>, private b: Lens<U, V>) { super(); }
    get = (obj: T) => this.b.get(this.a.get(obj));
    set = (value: V) => (obj: T) => this.a.set(this.b.set(value)(this.a.get(obj)))(obj);
}

export class ObjectLens<T, K extends keyof T> extends Lens<T, T[K]> {
    constructor(private k: K) { super(); }
    get = (obj: T) => obj[this.k];
    set = (value: T[K]) => (obj: T) => {
        if (obj[this.k] === value) {
            return obj;
        }
        const clone: T = Array.isArray(obj) ? obj.concat() as any : Object.assign({}, obj);
        clone[this.k] = value;
        return clone;
    }
}

export const id = <T>() => new IdLens<T>();

export const key = <T>() => <K extends keyof T>(k: K) => new ObjectLens<T, K>(k);
