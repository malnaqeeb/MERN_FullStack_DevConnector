import {
  GET_NOTIFICATIONS,
  GET_NOTIFICATIONS_ERROR,
  DELETE_NOTIFICATIONS
} from '../actions/types';
const initailState = {
  notifications: null,
  errors: {},
  loading: true
};

export default (state = initailState, action) => {
  const { type, payload } = action;
  switch (type) {
    case GET_NOTIFICATIONS:
      return {
        ...state,
        notifications: payload,
        loading: false
      };
    case DELETE_NOTIFICATIONS:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification._id !== payload
        ),
        loading: false
      };
    case GET_NOTIFICATIONS_ERROR:
      return {
        ...state,
        errors: payload,
        loading: false
      };
    default:
      return state;
  }
};
