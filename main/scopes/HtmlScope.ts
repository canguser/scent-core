import { BasicScope, BasicScopeOptions } from './BasicScope';
import { execExpression } from '@rapidly/utils/lib/commom/string/execExpression';

export interface HtmlScopeOptions extends BasicScopeOptions {
    expression: string;
}

export class HtmlScope extends BasicScope<Element, HtmlScopeOptions> {
    protected readonly aggregated: boolean = true;

    render(): void {
        if (!this.options.expression) return;
        const oldContent = this.target.innerHTML;
        const newContent = execExpression(this.options.expression, this.getContextObject());
        if (oldContent !== newContent) {
            this.target.innerHTML = newContent;
        }
    }
}
