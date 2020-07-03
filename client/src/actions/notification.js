import axios from 'axios';
import {
  GET_NOTIFICATIONS,
  GET_NOTIFICATIONS_ERROR,
  DELETE_NOTIFICATIONS
} from './types';

export const getNotifications = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/notification/');
    dispatch({ type: GET_NOTIFICATIONS, payload: res.data });
  } catch (error) {
    dispatch({
      type: GET_NOTIFICATIONS_ERROR,
      payload: error.response.data
    });
  }
};
export const deleteNotifications = (notificationId) => async (dispatch) => {
  try {
    await axios.delete(`/api/notification/${notificationId}`);
    dispatch({ type: DELETE_NOTIFICATIONS, payload: notificationId });
  } catch (error) {
    dispatch({
      type: GET_NOTIFICATIONS_ERROR,
      payload: error.response.data
    });
  }
};
