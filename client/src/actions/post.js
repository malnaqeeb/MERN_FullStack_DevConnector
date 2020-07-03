import axios from 'axios';
import { setAlert } from './alert';
import {
  GET_POSTS,
  POST_ERROR,
  UPDATE_LIKES,
  DELETE_POST,
  ADD_POST,
  GET_POST,
  ADD_COMMENT,
  REMOVE_COMMENT,
  ADD_EMOJI,
  REMOVE_EMOJI
} from './types';

export const getPosts = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/posts');
    dispatch({
      type: GET_POSTS,
      payload: res.data
    });
  } catch (error) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status
      }
    });
  }
};

// add like
export const addLike = (postId) => async (dispatch) => {
  try {
    const res = await axios.put(`/api/posts/like/${postId}`);
    dispatch({
      type: UPDATE_LIKES,
      payload: { postId, likes: res.data }
    });
  } catch (error) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: error.response.data.msg,
        status: error.response.status
      }
    });
  }
};

// Remove like
export const removeLike = (postId) => async (dispatch) => {
  try {
    const res = await axios.put(`/api/posts/unlike/${postId}`);
    dispatch({
      type: UPDATE_LIKES,
      payload: { postId, likes: res.data }
    });
  } catch (error) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: error.response.data.msg,
        status: error.response.status
      }
    });
  }
};

// Delete Post
export const deletePost = (id) => async (dispatch) => {
  try {
    await axios.delete(`/api/posts/${id}`);
    dispatch({
      type: DELETE_POST,
      payload: id
    });
    dispatch(setAlert('Post Removed', 'success'));
  } catch (error) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: error.response.data.msg,
        status: error.response.status
      }
    });
  }
};

// Add Post
export const addPost = (formData) => async (dispatch) => {
  const isValidLink = (string) => {
    if (/(http(s?)):\/\//i.test(string)) {
      return true;
    } else return false;
  };
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  if (formData.link!=="" && !isValidLink(formData.link)) {
    dispatch(setAlert('Please add a valid link', 'danger', 3000));
  } else {
    try {
      const res = await axios.post('/api/posts', formData, config);
      dispatch({
        type: ADD_POST,
        payload: res.data
      });
      dispatch(setAlert('Post Created', 'success'));
    } catch (error) {
      const errors = error.response.data.errors;

      if (errors) {
        errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
      }
      dispatch({
        type: POST_ERROR,
        payload: {
          msg: error.response.data.msg,
          status: error.response.status
        }
      });
    }
  }
};

// Get post
export const getPost = (id) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/posts/${id}`);
    dispatch({
      type: GET_POST,
      payload: res.data
    });
  } catch (error) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: error.response.data.msg,
        status: error.response.status
      }
    });
  }
};

// Add Comment
export const addComment = (postId, formData) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const res = await axios.post(
      `/api/posts/comment/${postId}`,
      formData,
      config
    );
    dispatch({
      type: ADD_COMMENT,
      payload: res.data
    });
    dispatch(setAlert('Comment Added', 'success'));
  } catch (error) {
    const errors = error.response.data.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: POST_ERROR
    });
  }
};
// Delete Comment
export const deleteComment = (postId, commentId) => async (dispatch) => {
  try {
    await axios.delete(`/api/posts/comment/${postId}/${commentId}`);
    dispatch({
      type: REMOVE_COMMENT,
      payload: commentId
    });
    dispatch(setAlert('Comment Removed', 'success'));
  } catch (error) {
    const errors = error.response.data.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: POST_ERROR
    });
  }
};

// Add emoji to post
export const addEmoji = (postId, emoji, commentId = undefined) => async (
  dispatch
) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    let res;
    if (commentId) {
      res = await axios.put(
        `/api/posts/comment/emoji/${postId}/${commentId}`,
        emoji,
        config
      );
    } else {
      res = await axios.put(`/api/posts/emoji/${postId}`, emoji, config);
    }
    dispatch({
      type: ADD_EMOJI,
      postId: postId,
      payload: res.data.emojis,
      commentId
    });

    // return res;
  } catch (error) {
    const errors = error.response.data.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: POST_ERROR
    });
  }
};

// Remove emoji from post
export const removeEmoji = (postId, emojiId, commentId = undefined) => async (
  dispatch
) => {
  try {
    let res;
    if (commentId) {
      res = await axios.delete(
        `/api/posts/comment/emoji/${postId}/${commentId}/${emojiId}`
      );
    } else {
      res = await axios.delete(`/api/posts/emoji/${postId}/${emojiId}`);
    }

    dispatch({
      type: REMOVE_EMOJI,
      payload: emojiId,
      postId: postId,
      emojis: res.data.emojis,
      commentId
    });
  } catch (error) {
    console.log(error);
    const errors = error.response.data.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: POST_ERROR
    });
  }
};
