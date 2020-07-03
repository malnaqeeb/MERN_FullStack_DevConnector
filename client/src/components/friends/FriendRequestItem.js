import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AcceptFriendRequest } from '../../actions/friends';

const FriendRequestItem = ({
  auth,
  friend: {
    _id,
    user: { name, avatar, id }
  },
  AcceptFriendRequest
}) => {
  return (
    <li className="profile bg-light" key={id}>
      <img src={avatar} alt="" className="round-img" />
      <Link to={`/profile/${id}`}>
        <img className="round-img" alt=""/>
        <h4>{name}</h4>
      </Link>
      <button onClick={() => AcceptFriendRequest(_id)}> Accept </button>
      <button> Cancel </button>
    </li>
  );
};

FriendRequestItem.propTypes = {
  friend: PropTypes.object.isRequired,
  AcceptFriendRequest: PropTypes.func.isRequired
};
const mapStateToProps = (state) => ({
  auth: state.auth
  //   friend: state.friendsrquestlist
});

export default connect(mapStateToProps, { AcceptFriendRequest })(
  FriendRequestItem
);
