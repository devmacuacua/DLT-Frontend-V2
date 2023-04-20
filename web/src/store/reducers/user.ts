import { GET_USERNAMES } from "../actions/types";

const initialState = {
  interventions: [],
};

function userReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_USERNAMES:
      return {
        ...state,
        users: payload,
      };
    default:
      return state;
  }
}

export default userReducer;
