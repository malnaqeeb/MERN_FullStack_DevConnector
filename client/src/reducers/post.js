import {
  POST_ERROR,
  GET_POSTS,
  UPDATE_LIKES,
  DELETE_POST,
  ADD_POST,
  GET_POST,
  ADD_COMMENT,
  REMOVE_COMMENT,
  ADD_EMOJI,
  REMOVE_EMOJI,
} from '../actions/types';
const initailState = {
  posts: [],
  post: null,
  loading: true,
  error: {},
};
export default function (state = initailState, action) {
  const { type, payload, postId, emojis, commentId } = action;
  switch (type) {
    case GET_POSTS:
      return {
        ...state,
        posts: payload,
        loading: false,
      };
    case GET_POST: {
      return {
        ...state,
        post: payload,
        loading: false,
      };
    }
    case ADD_POST:
      return {
        ...state,
        posts: [payload, ...state.posts],
        loading: false,
      };
    case DELETE_POST: {
      return {
        ...state,
        posts: state.posts.filter((post) => post._id !== payload),
        loading: false,
      };
    }
    case POST_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    case UPDATE_LIKES: {
      return {
        ...state,
        posts: state.posts.map((post) =>
          post._id === payload.postId
            ? { ...post, likes: payload.likes }
            : post,
        ),
        loading: false,
      };
    }
    case ADD_COMMENT: {
      return {
        ...state,
        post: { ...state.post, comments: payload },
        loading: false,
      };
    }
    case REMOVE_COMMENT: {
      return {
        ...state,
        post: {
          ...state.post,
          comments: state.post.comments.filter(
            (comment) => comment._id !== payload,
          ),
        },
        loading: false,
      };
    }

    case ADD_EMOJI: {
      if (commentId) {
        return {
          ...state,
          posts: state.posts.map((post, index) =>
            post._id === postId
              ? {
                  ...post,
                  comments: post.comments.map((comment) =>
                    comment._id === commentId
                      ? { ...comment, emojis: payload }
                      : comment,
                  ),
                }
              : post,
          ),
          post:
            state.post && state.post._id === postId
              ? {
                  ...state.post,
                  comments: state.post.comments.map((comment) =>
                    comment._id === commentId
                      ? { ...comment, emojis: payload }
                      : comment,
                  ),
                }
              : state.post,

          loading: false,
        };
      } else {
        return {
          ...state,
          posts: state.posts.map((post, index) =>
            post._id === postId ? { ...post, emojis: payload } : post,
          ),
          post:
            state.post && state.post._id === postId
              ? { ...state.post, emojis: payload }
              : state.post,

          loading: false,
        };
      }
    }
    case REMOVE_EMOJI: {
      if (commentId) {
        return {
          ...state,
          posts: state.posts.map((post, index) =>
            post._id === postId
              ? {
                  ...post,
                  comments: post.comments.map((comment) =>
                    comment._id === commentId
                      ? { ...comment, emojis: emojis }
                      : comment,
                  ),
                }
              : post,
          ),
          post:
            state.post && state.post._id === postId
              ? {
                  ...state.post,
                  comments: state.post.comments.map((comment) =>
                    comment._id === commentId
                      ? { ...comment, emojis: emojis }
                      : comment,
                  ),
                }
              : state.post,

          loading: false,
        };
      } else {
        return {
          ...state,
          posts: state.posts.map((post, index) =>
            post._id === postId
              ? {
                  ...post,
                  emojis,
                }
              : post,
          ),
          post:
            state.post && state.post._id === postId
              ? {
                  ...state.post,
                  emojis,
                }
              : state.post,
          loading: false,
        };
      }
    }
    default:
      return state;
  }
}
