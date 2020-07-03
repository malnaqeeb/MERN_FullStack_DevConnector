import React, { useEffect, Fragment } from 'react';
import { getFriendRequestsList } from '../../actions/friends';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
// import FriendRequestItem from './FriendRequestItem';
import FriendRquestCard from '../layout/FriendRquestCard';
import ElementNotFound from '../layout/ElementNotFound';

const FriendsRequestslist = ({
  getFriendRequestsList,
  friendsObject: { friendsrquestlist, loading }
}) => {
  useEffect(() => {
    getFriendRequestsList();
  }, [getFriendRequestsList]);
  return (
    <Fragment>
      {loading ? (
        <Spinner />
      ) : (
        <Fragment>
          <h1 className="text-center text-primary">Friends request List</h1>
          {friendsrquestlist.length > 0 ? (
            friendsrquestlist.map((friend) => (
              <FriendRquestCard key={friend._id} friend={friend} />
            ))
          ) : (
            <ElementNotFound element="FRIEND REQUESTS"/>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

FriendsRequestslist.propTypes = {
  getFriendRequestsList: PropTypes.func.isRequired,
  friendsObject: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  friendsObject: state.friendsObject
});

export default connect(mapStateToProps, { getFriendRequestsList })(
  FriendsRequestslist
);
