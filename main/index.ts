import { configuration } from './configure';
import { genOrderedId } from '@rapidly/utils/lib/commom/genOrderedId';
import { ScopeManager } from './scopes/managers/ScopeManager';
import { GlobalContext } from './context/GlobalContext';
import { IfScope } from './scopes/IfScope';
import { TextScope } from './scopes/TextScope';
import { AttrScope } from './scopes/AttrScope';
import { EventScope } from './scopes/EventScope';
import { ElementSetterScope } from './scopes/ElementSetterScope';
import { ForScope } from './scopes/ForScope';

configuration.override({
    idGenerator: () => '_' + genOrderedId(),
    instances: {
        scopeManager: new ScopeManager(),
        globalContext: new GlobalContext()
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

export const globalVars = GlobalContext.prototype as any;

export * from './configure';
export * from './scopes/TextScope';
export * from './scopes/managers/ScopeManager';
export * from './scopes/IfScope';
export * from './context/AdaptedContext';
export * from './adaptor/ProxyAdaptor';

export function use(callback: (config: typeof configuration) => void) {
    callback(configuration);
}
