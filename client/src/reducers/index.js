import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
import profile from './profile';
import post from './post';
import friendsObject from './friends';
import message from './message';
import group from './group';
import notification from './notification';
export default combineReducers({
  alert,
  auth,
  profile,
  post,
  group,
  message,
  friendsObject,
  notification
});
