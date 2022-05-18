import { getProperty } from '@rapidly/utils/lib/object/getProperty';
import { merge } from '../utils/NormalUtils';
import { ScentObject } from '../utils/ScentObject';
import { configureMerge, MergeOptions } from '@rapidly/utils/lib/commom/object/merge';

export class Configuration extends ScentObject {
    configs: {
        [key: string]: any;
    } = {};

    public merge(configs: object, options?: MergeOptions): Configuration {
        const mergeFn = options ? configureMerge(options) : merge;
        mergeFn(this.configs, configs);
        return this;
    }

    public getConfigurationOf(key: string): Configuration {
        const result = new Configuration();
        result.configs = getProperty(this.configs, key, {});
        return result;
    }

    public get<T = any>(key?: string, defaultValue?: T): T {
        let value;
        if (key == null) {
            value = this.configs;
        } else {
            value = getProperty(this.configs, key) as T;
        }
        if (value == null) {
            value = defaultValue;
        }
        return value;
    }
}
