import React from 'react';
import { Button, Card, Image } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  AcceptFriendRequest,
  RejectFriendRequest
} from '../../actions/friends';

const FriendRquestCard = ({
  auth,
  friend: {
    _id,
    user: { name, avatar, email }
  },
  AcceptFriendRequest,
  RejectFriendRequest
}) => (
  <Card.Group>
    <Card>
      <Card.Content>
        <Image floated="right" size="mini" src={avatar} />
        <Card.Header>{name}</Card.Header>
        <Card.Header>{email}</Card.Header>
        <Card.Description>
          {name} wants to add you as a friend.
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
          <Button basic color="green" onClick={() => AcceptFriendRequest(_id)}>
            Approve
          </Button>
          <Button basic color="red" onClick={() => RejectFriendRequest(_id)}>
            Decline
          </Button>
        </div>
      </Card.Content>
    </Card>
  </Card.Group>
);
FriendRquestCard.propTypes = {
  AcceptFriendRequest: PropTypes.func.isRequired,
  RejectFriendRequest: PropTypes.func.isRequired
};
const mapStateToProps = (state) => ({
  auth: state.auth
});
export default connect(mapStateToProps, {
  AcceptFriendRequest,
  RejectFriendRequest
})(FriendRquestCard);
