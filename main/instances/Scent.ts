import { ScentObject } from '../utils/ScentObject';
import { Configuration } from '../configure/Configuration';
import { AdaptedContext } from '../context/AdaptedContext';
import { genOrderedId } from '@rapidly/utils/lib/commom/genOrderedId';
import { ScopeManager } from './ScopeManager';
import { GlobalContext } from '../context/GlobalContext';
import { IfScope } from '../scopes/IfScope';
import { TextScope } from '../scopes/TextScope';
import { ForScope } from '../scopes/ForScope';
import { AttrScope } from '../scopes/AttrScope';
import { EventScope } from '../scopes/EventScope';
import { ElementSetterScope } from '../scopes/ElementSetterScope';
import { HtmlScope } from '../scopes/HtmlScope';

export type PluginCallback = (instance: Scent) => void;

export class Scent extends ScentObject {
    public configuration: Configuration;
    public globalContext: GlobalContext;

    constructor() {
        super();
        this.configuration = new Configuration();
        this.globalContext = new GlobalContext();
        this.configuration.merge({
            idGenerator: () => '_' + genOrderedId(),
            instances: {
                scopeManager: new ScopeManager(),
                globalContext: this.globalContext,
                scent: this,
            },
            scopes: {
                if: IfScope,
                text: TextScope,
                for: ForScope,
                attr: AttrScope,
                event: EventScope,
                setter: ElementSetterScope,
                html: HtmlScope
            }
        });
    }

    createContext(context: object = {}): AdaptedContext {
        return new AdaptedContext(context, {
            configuration: this.configuration
        });
    }

    use(plugin: PluginCallback) {
        if (typeof plugin === 'function') {
            plugin(this);
        }
        return this;
    }
}
