import {
  SEND_MESSAGE,
  GET_USERS,
  PROFILE_ERROR,
  GET_MESSAGES,
  DELETE_MESSAGE,
  DELETE_ALL_MESSAGES,
  SEND_MESSAGE_ERROR
} from '../actions/types';
const initailState = {
  messages: [],
  users: [],
  connectedUsers: [],
  errors: {},
  loading: true
};
export default (state = initailState, action) => {
  const { type, payload } = action;
  switch (type) {
    case SEND_MESSAGE:
    case GET_MESSAGES:
      return {
        ...state,
        messages: payload,
        loading: false
      };

    case DELETE_ALL_MESSAGES:
      return {
        ...state,
        messages: [],
        users: state.users.filter((user) => user.corresponder._id !== payload),
        loading: false
      };
    case DELETE_MESSAGE:
      return {
        ...state,
        messages: payload,
        loading: false
      };
    case GET_USERS:
      return {
        ...state,
        users: payload,
        loading: false
      };
    case SEND_MESSAGE_ERROR:
    case PROFILE_ERROR:
      return {
        ...state,
        errors: payload,
        loading: false
      };
    default:
      return state;
  }
};
