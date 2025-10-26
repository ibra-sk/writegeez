export type InputMethod = Record<string, SymbolMap>;
export interface SymbolMap {
    value: string | null;
    next: InputMethod | null;
}

export type InputMethodSpec = { name: string; code: string; map: InputMethod };
