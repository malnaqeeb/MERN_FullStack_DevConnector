import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card, List, Icon, Image } from 'semantic-ui-react';
const UsersChatList = ({ corresponder, deleteAllMessages }) => {
  const { avatar, name } = corresponder.corresponder;

  return (
    <Card>
      <List animated verticalAlign="middle">
        <List.Item>
          <Icon
            className="delete-user-list"
            name="delete"
            onClick={() => deleteAllMessages(corresponder.corresponder._id)}
          />
          <Image avatar src={avatar} />
          <Link to={`/message/${corresponder.corresponder._id}`}>
            <List.Content>
              <List.Header>{name}</List.Header>
            </List.Content>
          </Link>
        </List.Item>
      </List>
    </Card>
  );
};

UsersChatList.propTypes = {
  corresponder: PropTypes.object.isRequired,
  deleteAllMessages: PropTypes.func.isRequired
};

export default UsersChatList;
