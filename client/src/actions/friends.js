import axios from 'axios';
// import { setAlert } from './alert';
import {
  GET_FRIENDSLIST,
  GET_FRIENDREQUESTSLIST,
  SEND_FRIENDREQUEST,
  ACCEPT_FRIENDREQUEST,
  REJECT_FRIENDREQUEST,
  UNFRIEND,
  CANCEL_REQUEST,
  FRIENDS_ERROR
} from './types';

// Get friends list
export const getFriendsList = () => async (dispatch) => {
  try {
    const res = await axios.get('api/friends');
    dispatch({
      type: GET_FRIENDSLIST,
      payload: res.data.friends
    });
  } catch (err) {
    dispatch({
      type: FRIENDS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Get friends requests list
export const getFriendRequestsList = () => async (dispatch) => {
  try {
    const res = await axios.get('api/friends/requests');
    dispatch({
      type: GET_FRIENDREQUESTSLIST,
      payload: res.data.friendRequests
    });
    // console.log('from action friendrequests',res.data.friendRequests)
  } catch (err) {
    dispatch({
      type: FRIENDS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// add friend
export const sendFriendRequest = (friendId) => async (dispatch) => {
  try {
    const res = await axios.post(`api/friends/${friendId}`);

    dispatch({
      type: SEND_FRIENDREQUEST,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: FRIENDS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};
// Accept friend request
export const AcceptFriendRequest = (requestId) => async (dispatch) => {
  try {
    const res = await axios.put(`api/friends/requests/${requestId}`);
    dispatch({
      type: ACCEPT_FRIENDREQUEST,
      payload: res.data
    });
    // console.log('from action friendrequests',res.data)
  } catch (err) {
    dispatch({
      type: FRIENDS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Reject friend request
export const RejectFriendRequest = (requestId) => async (dispatch) => {
  try {
    const res = await axios.delete(`api/friends/requests/${requestId}`);

    dispatch({
      type: REJECT_FRIENDREQUEST,
      payload: res.data
    });
    // console.log('from action friendrequests', res.data);
  } catch (err) {
    dispatch({
      type: FRIENDS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

export const Unfriend = (friendId) => async (dispatch) => {
  try {
    const res = await axios.delete(`api/friends/${friendId}`);

    dispatch({
      type: UNFRIEND,
      payload: res.data
    });
    console.log('from action friendrequests', res.data);
  } catch (err) {
    dispatch({
      type: FRIENDS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// cancel friend request
export const CancelFriendRequest = (requestId) => async (dispatch) => {
  try {
    const res = await axios.delete(`api/friends/cancel/${requestId}`);

    dispatch({
      type: CANCEL_REQUEST,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: FRIENDS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};
