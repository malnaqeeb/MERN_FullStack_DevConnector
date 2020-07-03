import {
  GET_PROFILE,
  PROFILE_ERROR,
  CLEAR_PROFILE,
  UPDATE_PROFILE,
  SET_PRIVACYOPTIONS,
  GET_PROFILES,
  GET_REPOS
} from '../actions/types';
const initailState = {
  profile: null,
  profiles: [],
  repos: [],
  loading: true,
  errors: {}
};

export default (state = initailState, action) => {
  const { type, payload } = action;

  switch (type) {
    case UPDATE_PROFILE:
    case GET_PROFILE:
    case SET_PRIVACYOPTIONS:
      return {
        ...state,
        profile: payload,
        loading: false
      };
    case GET_PROFILES: {
      return {
        ...state,
        profiles: payload,
        loading: false
      };
    }
    case PROFILE_ERROR:
      return {
        ...state,
        errors: payload,
        loading: false
      };
    case CLEAR_PROFILE:
      return {
        ...state,
        profile: null,
        repos: [],
        loading: false
      };
    case GET_REPOS:
      return {
        ...state,
        repos: payload,
        loading: false
      };
    default:
      return state;
  }
};
