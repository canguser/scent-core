import { configureMerge } from '@rapidly/utils/lib/commom/object/merge';
import { ScentObject } from './ScentObject';

export function ergodicTree<NodeType>(tree: NodeType, childProperty: string = 'childNodes', parentNode?: NodeType) {
    return function (
        callback: (
            node: NodeType,
            parent: NodeType,
            preventDeeply?: () => void,
            extraNodes?: (...nodes) => void
        ) => void | Promise<void>
    ) {
        let prevent = false;
        let extraNodes = [];
        const result = callback(
            tree,
            parentNode,
            () => {
                prevent = true;
            },
            (...nodes) => {
                extraNodes = nodes || [];
            }
        );

        function doAfter() {
            if (!prevent) {
                const results = [...tree[childProperty], ...extraNodes].map((node) =>
                    ergodicTree(node, childProperty, tree)(callback)
                );
                const promises = results.filter((r) => r instanceof Promise);
                if (promises.length > 0) {
                    return Promise.all(results);
                }
                return results;
            }
        }

        if (result instanceof Promise) {
            return result.then(() => doAfter());
        }

        return doAfter();
    };
}

export function toDashName(name) {
    return name
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
}

export function toCamelName(name) {
    return name.replace(/-([a-z])/g, (m, w) => w.toUpperCase());
}

export const merge = configureMerge({
    integralClasses: [ScentObject]
});

export function diffFrom(keys, newKeys) {
    const newKeyDiffResults = [];
    const newKeysWithoutNew = [];

    for (let i = 0; i < newKeys.length; i++) {
        const newKey = newKeys[i];
        if (keys.indexOf(newKey) === -1) {
            newKeyDiffResults.push({
                add: true,
                key: newKey,
                index: i
            });
        } else {
            newKeysWithoutNew.push(newKey);
        }
    }

    const newKeysIndexMap = newKeysWithoutNew.reduce((map, key, index) => {
        map[key] = index;
        return map;
    }, {});

    const diffResults = [];
    const keysWithoutDelete = [];

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const newIndex = newKeysIndexMap[key];
        if (newIndex == null) {
            diffResults.unshift({
                key,
                remove: true,
                index: i
            });
        } else {
            keysWithoutDelete.push(key);
        }
    }

    for (let i = 0; i < keysWithoutDelete.length; i++) {
        const key = keysWithoutDelete[i];
        const newIndex = newKeysIndexMap[key];
        if (newIndex === i) {
            /*diffResults.push({
                change: false,
                key,
                index: i
            });*/
        } else if (newIndex !== i) {
            diffResults.push({
                change: true,
                key,
                oldIndex: i,
                index: newIndex
            });
        }
    }

    diffResults.push(...newKeyDiffResults);
    const realDiffResults = [];
    for (let i = 0; i < diffResults.length; i++) {
        const diff = diffResults[i];
        if (diff.change) {
            const lastDiff = realDiffResults[realDiffResults.length - 1];
            if (lastDiff && diff.index - 1 === lastDiff.offsetIndex && diff.oldIndex - 1 === lastDiff.offsetOldIndex) {
                lastDiff.keys.push(diff.key);
                lastDiff.offsetIndex = diff.index;
                lastDiff.offsetOldIndex = diff.oldIndex;
                continue;
            }
            diff.keys = [diff.key];
            diff.offsetIndex = diff.index;
            diff.offsetOldIndex = diff.oldIndex;
            delete diff.key;
        } else if (diff.add) {
            const lastDiff = realDiffResults[realDiffResults.length - 1];
            if (lastDiff && diff.index - 1 === lastDiff.offsetIndex) {
                lastDiff.keys.push(diff.key);
                lastDiff.offsetIndex = diff.index;
                continue;
            }
            diff.keys = [diff.key];
            diff.offsetIndex = diff.index;
            delete diff.key;
        }
        realDiffResults.push(diff);
    }

    return realDiffResults;
}

type Constructor<T> = new (...args: any[]) => T;

export function wrapPrototype<T extends object, C>(obj: T, type: Constructor<C>): T & C {
    const proto = Object.getPrototypeOf(obj);
    const wrappedProto = type.prototype;
    Object.setPrototypeOf(
        obj,
        new Proxy(
            {
                get origin() {
                    return proto;
                },
                get wrapped() {
                    return wrappedProto;
                }
            },
            {
                get(target, prop, receiver) {
                    const originValue = Reflect.get(target.origin, prop);
                    if (originValue !== undefined) {
                        return originValue;
                    }
                    return Reflect.get(target.wrapped, prop);
                },
                set() {
                    return false;
                },
                has(target, prop) {
                    return Reflect.has(target.origin, prop) || Reflect.has(target.wrapped, prop);
                }
            }
        )
    );
    return obj as T & C;
}
