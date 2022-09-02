import { merge, wrapPrototype } from '../utils/NormalUtils';
import { configuration } from '../configure';
import { TextScope, TextScopeOptions } from '../scopes/TextScope';
import { IfScope, IfScopeOptions } from '../scopes/IfScope';
import { ScentObject } from '../utils/ScentObject';
import { ScopeManager } from '../instances/ScopeManager';
import { ForScope, ForScopeOptions } from '../scopes/ForScope';
import { BasicScope, BasicScopeOptions } from '../scopes/BasicScope';
import { AttrScope, AttrScopeOptions } from '../scopes/AttrScope';
import { EventScope, EventScopeOptions } from '../scopes/EventScope';
import { ElementSetterScope, ElementSetterScopeOptions } from '../scopes/ElementSetterScope';
import { GlobalContext } from './GlobalContext';
import { HtmlScope, HtmlScopeOptions } from '../scopes/HtmlScope';

export interface ContextOptions {
    configuration?: typeof configuration;
}

const defaultOptions: ContextOptions = {
    configuration
};

type Scopes = {
    [key: string]: BasicScope;
    bindText: TextScope;
    bindIf: IfScope;
    bindFor: ForScope;
    bindAttr: AttrScope;
    bindEvent: EventScope;
    bindSetter: ElementSetterScope;
    bindHtml: HtmlScope;
};

type ScopeOptions = {
    [key: string]: BasicScopeOptions | any;
    bindText: TextScopeOptions;
    bindIf: IfScopeOptions;
    bindFor: ForScopeOptions;
    bindAttr: AttrScopeOptions;
    bindEvent: EventScopeOptions;
    bindSetter: ElementSetterScopeOptions;
    bindHtml: HtmlScopeOptions;
};

type ScopeBuilder<E> = { [key in keyof Scopes]: (ele: E, options?: ScopeOptions[key]) => string };

export abstract class Context<
    T extends object = object,
    E = Element,
    Options extends ContextOptions = ContextOptions
> extends ScentObject {
    protected context: T;
    protected options: Options;

    public get scope(): ScopeBuilder<E> {
        return new Proxy<ScopeBuilder<E>>({} as ScopeBuilder<E>, {
            get: (target: {}, p: string | symbol): any => {
                const scopes = this.configuration.get('scopes', {});
                if (typeof p === 'string') {
                    // get scope name by splice string after 'bind' and convert to lowercase initial
                    const parts = p.split('bind');
                    const scopeName = parts[1] ? parts[1].charAt(0).toLowerCase() + parts[1].slice(1) : '';
                    if (scopeName in scopes) {
                        return (ele, ...args) => {
                            const scope = new scopes[scopeName](ele, this, ...args);
                            this.scopeManager.renderScope(scope);
                            return scope.id;
                        };
                    }
                }
                return () => console.warn('no such scope bound:', p);
            },
            set: () => true
        });
    }

    get scopeManager(): ScopeManager {
        return this.configuration.get<ScopeManager>('instances.scopeManager');
    }

    public constructor(context?: T, options?: Options) {
        super();
        this.options = merge({} as Options, defaultOptions, options);
        const globalContext = this.configuration.get<GlobalContext>('instances.globalContext') || {};
        console.log(globalContext)
        this.context = wrapPrototype(this.buildContext(context || ({} as T)),globalContext as any);
    }

    public get configuration(): typeof configuration {
        return this.options.configuration;
    }

    public get contextGetter(): () => T {
        // const globalContext = this.configuration.get<GlobalContext>('instances.globalContext') || {};
        // const GlobalContextClass = function() {};
        // GlobalContextClass.prototype = globalContext;
        return () => this.context;
    }

    protected abstract buildContext(context: T): T;
}
