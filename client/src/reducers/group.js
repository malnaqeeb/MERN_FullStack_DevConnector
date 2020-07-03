import {
  GET_GROUPS,
  GET_GROUP,
  ADD_GROUP,
  DELETE_GROUP,
  UPDATE_GROUP,
  GET_GROUPPOST,
  ADD_GROUPPOST,
  UPDATE_GROUPPOST,
  DELETE_GROUPPOST,
  JOIN_GROUP,
  LEAVE_GROUP,
  ADD_POSTCOMMENT,
  DELETE_POSTCOMMENT,
  POST_ERROR,
  ADD_EVENT,
  DELETE_EVENT,
  ADD_GROUPPOSTEMOJI,
  REMOVE_GROUPPOSTEMOJI
} from '../actions/types';
const initailState = {
  groups: [],
  group: null,
  post: {},
  loading: true,
  error: {}
};
export default function (state = initailState, action) {
  const { type, payload } = action;
  switch (type) {
    case GET_GROUPS:
      return {
        ...state,
        groups: payload,
        loading: false
      };
    case GET_GROUP:
    case UPDATE_GROUP: {
      return {
        ...state,
        group: payload,
        loading: false
      };
    }
    case DELETE_GROUP: {
      return {
        ...state,
        groups: state.groups.filter((group) => group._id !== payload),
        loading: false
      };
    }
    case ADD_GROUP:
      return {
        ...state,
        groups: [payload, ...state.groups],
        loading: false
      };
    case JOIN_GROUP:
      return {
        ...state,
        group: { ...state.group, members: payload },
        loading: false
      };
    case LEAVE_GROUP:
      return {
        ...state,
        group: { ...state.group, members: payload },
        loading: false
      };
    case ADD_GROUPPOST:
      return {
        ...state,
        group: { ...state.group, posts: payload },
        loading: false
      };
    case GET_GROUPPOST:
      return {
        ...state,
        post: payload,
        loading: false
      };
    case DELETE_GROUPPOST:
      return {
        ...state,
        group: { ...state.group, posts: payload },
        loading: false
      };
    case UPDATE_GROUPPOST:
      return {
        ...state,
        post: { ...state.post, text: payload.text, title: payload.title },
        loading: false
      };
    case POST_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    case ADD_POSTCOMMENT:
      return {
        ...state,
        post: { ...state.post, comments: payload },
        loading: false
      };
    case DELETE_POSTCOMMENT:
      return {
        ...state,
        post: {
          ...state.post,
          comments: payload
        },
        loading: false
      };
    case ADD_EVENT:
      return {
        ...state,
        group: { ...state.group, events: payload },
        loading: false
      };
    case DELETE_EVENT:
      return {
        ...state,
        group: { ...state.group, events: payload },
        loading: false
      };
    case ADD_GROUPPOSTEMOJI:
    case REMOVE_GROUPPOSTEMOJI:
      return {
        ...state,
        post: { ...state.post, emojis: payload },
        loading: false
      };
    default:
      return state;
  }
}
