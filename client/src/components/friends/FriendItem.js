import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Unfriend } from '../../actions/friends';
import { Button } from 'semantic-ui-react';

const FriendItem = ({ auth, friend: { id, name, avatar, user }, Unfriend }) => {
  return (
    <div className="profile bg-light">
      <img src={avatar} alt="" className="round-img" />
      <Link to={`/profile/${id}`}>
        <img className="round-img" alt="" />
        <h4>{name}</h4>
      </Link>
      <Button onClick={() => Unfriend(id)} color="red">
        Unfriend
      </Button>
    </div>
  );
};

FriendItem.propTypes = {
  friend: PropTypes.object.isRequired
};

export default connect(null, { Unfriend })(FriendItem);
