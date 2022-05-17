import { configuration } from './configure';
import { genOrderedId } from '@rapidly/utils/lib/commom/genOrderedId';
import { ScopeManager } from './instances/ScopeManager';
import { GlobalContext } from './context/GlobalContext';
import { IfScope } from './scopes/IfScope';
import { TextScope } from './scopes/TextScope';
import { AttrScope } from './scopes/AttrScope';
import { EventScope } from './scopes/EventScope';
import { ElementSetterScope } from './scopes/ElementSetterScope';
import { ForScope } from './scopes/ForScope';
import { PluginCallback, Scent } from './instances/Scent';
import { AdaptedContext } from './context/AdaptedContext';
export * from './configure';
export * from './scopes/TextScope';
export * from './instances/ScopeManager';
export * from './scopes/IfScope';
export * from './context/AdaptedContext';
export * from './adaptor/ProxyAdaptor';
export * from './instances/Scent';

configuration.merge({
    idGenerator: () => '_' + genOrderedId(),
    instances: {
        scopeManager: new ScopeManager(),
        globalContext: new GlobalContext(),
        scent: new Scent()
    },
    scopes: {
        if: IfScope,
        text: TextScope,
        for: ForScope,
        attr: AttrScope,
        event: EventScope,
        setter: ElementSetterScope
    }
});

export function getDefaultInstance() {
    let scent = configuration.get('instances.scent');
    if (!scent) {
        scent = new Scent();
        configuration.merge({ instances: { scent } });
    }
    return scent;
}

export function createContext(context: object): AdaptedContext {
    const scent = getDefaultInstance();
    return scent.createContext(context);
}

export function use(plugin: PluginCallback) {
    const scent = getDefaultInstance();
    scent.use(plugin);
    return scent;
}
