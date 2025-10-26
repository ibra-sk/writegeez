import { InputMethod } from "./interfaces";
const inputMethods: Record<string, InputMethod> = {};

import TigrinyaEritrean from "./ti-ER";
export { default as TigrinyaEritrean } from './ti-ER';
inputMethods[TigrinyaEritrean.name] = TigrinyaEritrean.map;
