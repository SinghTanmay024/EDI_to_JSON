// store.js
import { createStore } from 'redux';

const initialState = {
  intermediateJSON: '',
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_INTERMEDIATE_JSON':
      return {
        ...state,
        intermediateJSON: action.payload,
      };
    default:
      return state;
  }
}

const store = createStore(rootReducer);

export default store;
