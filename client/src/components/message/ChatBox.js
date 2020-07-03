import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Image } from 'semantic-ui-react';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import { deleteMesage } from '../../actions/message';
const ChatBox = ({ messages, me, deleteMesage }) => {
  return (
    <>
      {messages.messages.map((message) =>
        message.isSent ? (
          <div className='messageContainer justifyEnd' key={message._id}>
            <Image src={me && me.avatar} avatar />

            <div className='messageBox backgroundBlue'>
              <Icon
                name='delete'
                className='btn-delete-isSent'
                onClick={() =>
                  deleteMesage(messages.corresponder._id, message._id)
                }
              />
              <p className='sentText pr-10'>
                {' '}
                <Moment style={{ color: '#fff' }} format='LT'>
                  {message.date}
                </Moment>
              </p>
              <p className='messageText colorWhite'>{message.message}</p>
            </div>
          </div>
        ) : (
          <div className='messageContainer justifyStart' key={message._id}>
            <Image src={messages.corresponder.avatar} avatar />
            <div className='messageBox backgroundLight'>
              <Icon
                name='delete'
                className='btn-delete-isSent'
                onClick={() =>
                  deleteMesage(messages.corresponder._id, message._id)
                }
              />
              <p className='sentText pr-10 '>
                {' '}
                <Moment format='LT'>{message.date}</Moment>
              </p>
              <p className='messageText colorDark'>{message.message}</p>
            </div>
          </div>
        )
      )}
    </>
  );
};

ChatBox.propTypes = {
  messages: PropTypes.object.isRequired,
  deleteMesage: PropTypes.func.isRequired,
};

export default connect(null, { deleteMesage })(ChatBox);
