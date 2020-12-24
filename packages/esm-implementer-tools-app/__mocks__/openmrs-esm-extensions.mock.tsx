let state;

export const extensionStore = {
  getState: () => state,
  setState: (val) => {
    state = { ...state, ...val };
  },
  subscribe: (updateFcn) => {
    updateFcn(state);
    return () => {};
  },
  unsubscribe: () => {},
};
