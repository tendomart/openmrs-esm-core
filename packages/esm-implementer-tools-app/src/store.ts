import { createGlobalStore, getGlobalStore } from "@openmrs/esm-api";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Store } from "unistore";

export interface ImplementerToolsStore {
  activeItemDescription?: ActiveItemDescription;
  configPathBeingEdited: null | string[];
  isOpen: boolean;
  isUIEditorEnabled: boolean;
}

export interface ActiveItemDescription {
  path: string[];
  description?: string;
  value?: string | string[];
  source?: string;
}

const store: Store<ImplementerToolsStore> = createGlobalStore(
  "implementer-tools",
  {
    activeItemDescription: undefined,
    configPathBeingEdited: null,
    isOpen: getIsImplementerToolsOpen(),
    isUIEditorEnabled: getIsUIEditorEnabled(),
  }
);

export const getStore = () =>
  getGlobalStore<ImplementerToolsStore>("implementer-tools");

export type Reducer = Function | Array<string> | Object;
export type Actions = Function | { [key: string]: Function };

function runReducer(state: ImplementerToolsStore, reducer: Reducer) {
  if (typeof reducer === "function") {
    return reducer(state);
  }
  const out = {};
  if (typeof reducer === "string") {
    out[reducer] = state[reducer];
  }
  if (Array.isArray(reducer)) {
    for (let i of reducer) {
      out[i] = state[i];
    }
  } else if (reducer) {
    for (let i in reducer) {
      out[i] = state[reducer[i]];
    }
  }
  return out;
}

function bindActions(store: Store<ImplementerToolsStore>, actions: Actions) {
  if (typeof actions == "function") {
    actions = actions(store);
  }
  const bound = {};
  for (let i in actions) {
    bound[i] = store.action(actions[i]);
  }
  return bound;
}

export function useStore(reducer: Reducer, actions?: Actions) {
  const [state, set] = useState(runReducer(store.getState(), reducer));
  useEffect(
    () => store.subscribe((state) => set(runReducer(state, reducer))),
    []
  );
  let boundActions = {};
  if (actions) {
    boundActions = useMemo(() => bindActions(store, actions), [store, actions]);
  }
  return { ...state, ...boundActions };
}

let lastValueOfIsOpen = false;
let lastValueOfIsUiEditorEnabled = false;
getStore().subscribe((state) => {
  if (state.isOpen != lastValueOfIsOpen) {
    setIsImplementerToolsOpen(state.isOpen);
    lastValueOfIsOpen = state.isOpen;
  }
  if (state.isUIEditorEnabled != lastValueOfIsUiEditorEnabled) {
    setIsUIEditorEnabled(state.isUIEditorEnabled);
    lastValueOfIsUiEditorEnabled = state.isUIEditorEnabled;
  }
});

function getIsImplementerToolsOpen(): boolean {
  return JSON.parse(localStorage.getItem("openmrs:openmrsImplementerToolsAreOpen") || "false") ?? false;
}

function setIsImplementerToolsOpen(value: boolean): void {
  localStorage.setItem("openmrs:openmrsImplementerToolsAreOpen", JSON.stringify(value));
}

function getIsUIEditorEnabled(): boolean {
  return JSON.parse(localStorage.getItem("openmrs:isUIEditorEnabled") || "false") ?? false;
}

function setIsUIEditorEnabled(enabled: boolean) {
  localStorage.setItem("openmrs:isUIEditorEnabled", JSON.stringify(enabled));
}
