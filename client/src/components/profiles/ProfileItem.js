import React from 'react';
import { Link } from 'react-router-dom';
import { Label, Icon } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { sendFriendRequest } from '../../actions/friends';
import { CancelFriendRequest } from '../../actions/friends';

const ProfileItem = ({
  auth: { user, isAuthenticated },
  sendFriendRequest,
  CancelFriendRequest,
  profile: {
    user: { _id, name, avatar, privacyOptions },
    status,
    company,
    location,
    skills
  },
  me
}) => {
  const FriendButton = () => {
    if (isAuthenticated) {
      const loggedUser = user._id === _id;
      if (!loggedUser) {
        const isFriend = user.friends.filter((friend) => friend === _id);

        const hasRequest = user.friendRequests.filter(
          (req) => req.user === _id
        );
        const UserIdOfRequest = hasRequest.map((req) => req.user);
        if (isFriend.length > 0) {
          return (
            <Label style={{marginRight:"0.5rem"}}>
              {' '}
              <Icon name="check circle" color="green" /> Friend
            </Label>
          );
        }

        if (hasRequest.length > 0) {
          if (hasRequest[0].isSent) {
            return (
              <button
                onClick={() => CancelFriendRequest(UserIdOfRequest)}
                className="btn btn-primary"
              >
                {' '}
                Cancel request{' '}
              </button>
            );
          } else {
            return (
              <Label variant="contained" color="secondary">
                {name} sent you a friend request
              </Label>
            );
          }
        }

        return (
          <button
            onClick={() => sendFriendRequest(_id)}
            className="btn btn-primary"
          >
            {' '}
            Add Friend{' '}
          </button>
        );
      }
    }
    return <></>;
  };
  return (
    <div className="profile bg-light">
      <img src={avatar} className="round-img" alt={name} />
      <div>
        <h2>{name}</h2>
        <p>
          {status} {company && <span> at {company}</span>}
        </p>
        <p className="my-1">{location && <span>{location}</span>}</p>
        <Link to={`/profile/${_id}`} className="btn btn-primary">
          View Profile
        </Link>
        <FriendButton className="btn btn-primary"/>
        {me.isAuthenticated &&
          me.user._id !== _id &&
          privacyOptions &&
          (privacyOptions.messagesEveryone ||
            user.friends.filter((friend) => friend === _id).length > 0) && (
            <Link to={`/message/${_id}`} className="btn btn-primary my">
              Send Message
            </Link>
          )}
      </div>
      <ul>
        {skills.slice(0, 4).map((skill, index) => (
          <li key={index} className="text-primary">
            <i className="fas fa-check"></i> {skill}{' '}
          </li>
        ))}
      </ul>
    </div>
  );
};
ProfileItem.propTypes = {
  profile: PropTypes.object.isRequired,
  sendFriendRequest: PropTypes.func.isRequired,
  CancelFriendRequest: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool
};
const mapStateToProps = (state) => ({
  auth: state.auth
});
export default connect(mapStateToProps, {
  sendFriendRequest,
  CancelFriendRequest
})(ProfileItem);
