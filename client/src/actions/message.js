import axios from 'axios';
import {
  SEND_MESSAGE,
  GET_USERS,
  GET_MESSAGES,
  DELETE_MESSAGE,
  DELETE_ALL_MESSAGES,
  SEND_MESSAGE_ERROR
} from './types';

export const sendMessage = (formData) => async (dispatch) => {
  dispatch({ type: SEND_MESSAGE, payload: formData });
};
export const getMessages = (
  corresponderId,
  formData,
  socketMsg = false
) => async (dispatch) => {
  if (socketMsg) {
    return dispatch({ type: GET_MESSAGES, payload: formData });
  }
  try {
    const res = await axios.get(`/api/users/message/${corresponderId}`);

    dispatch({ type: GET_MESSAGES, payload: res.data.messages });
  } catch (error) {
    dispatch({
      type: SEND_MESSAGE_ERROR,
      payload: {
        msg: error.response.data.statusText,
        status: error.response.status
      }
    });
  }
};

export const fetchContacts = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/users/message');

    dispatch({ type: GET_USERS, payload: res.data.corresponders });
  } catch (error) {
    dispatch({
      type: SEND_MESSAGE_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status
      }
    });
  }
};

export const deleteMesage = (corresponderId, messageId) => async (dispatch) => {
  try {
    const res = await axios.delete(
      `/api/users/message/${corresponderId}/${messageId}`
    );
    dispatch({ type: DELETE_MESSAGE, payload: res.data });
  } catch (error) {
    dispatch({
      type: SEND_MESSAGE_ERROR,
      payload: {
        msg: error.response.data.statusText,
        status: error.response.status
      }
    });
  }
};
export const deleteAllMessages = (corresponderId) => async (dispatch) => {
  try {
    await axios.patch(`/api/users/message/${corresponderId}`);
    dispatch({ type: DELETE_ALL_MESSAGES, payload: corresponderId });
  } catch (error) {
    dispatch({
      type: SEND_MESSAGE_ERROR,
      payload: {
        msg: error.response.data.statusText,
        status: error.response.status
      }
    });
  }
};
