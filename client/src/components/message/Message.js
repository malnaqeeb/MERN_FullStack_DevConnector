import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ScrollToBotton from 'react-scroll-to-bottom';
import {
  sendMessage,
  getMessages,
  fetchContacts,
  deleteAllMessages
} from '../../actions/message';
import UsersChatList from './UsersChatList';
import InputMessage from './InputMessage';
import ChatBox from './ChatBox';

const Message = ({
  sendMessage,
  fetchContacts,
  auth,
  match,
  message,
  getMessages,
  deleteAllMessages
}) => {
  useEffect(() => {
    getMessages(match.params.id);
    fetchContacts();
  }, [match.params.id, fetchContacts, getMessages]);

  return (
    <>
      <div className="row">
        <div className="user-chat-list">
          {message.users.length > 0 &&
            message.users.map((user) => (
              <UsersChatList
                corresponder={user}
                key={user.corresponder._id}
                deleteAllMessages={deleteAllMessages}
              />
            ))}
        </div>
        <ScrollToBotton className="messages">
          {message.messages.length !== 0 && (
            <ChatBox messages={message.messages} me={auth.user} />
          )}
        </ScrollToBotton>
        <InputMessage
          corresponderId={match.params.id}
          sendMessage={sendMessage}
          me={auth.user}
          messages={message.messages}
        />
      </div>
    </>
  );
};

Message.propTypes = {
  sendMessage: PropTypes.func.isRequired,
  deleteAllMessages: PropTypes.func.isRequired,
  fetchContacts: PropTypes.func.isRequired,
  getMessages: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  message: PropTypes.object.isRequired
};
const mapStateToProps = (state) => ({
  auth: state.auth,
  message: state.message
});

export default connect(mapStateToProps, {
  sendMessage,
  deleteAllMessages,
  fetchContacts,
  getMessages
})(Message);
