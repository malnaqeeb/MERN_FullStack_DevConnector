import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, TextArea, Button } from 'semantic-ui-react';
import io from 'socket.io-client';
let socket;
const InputMessage = ({ corresponderId, sendMessage, me }) => {
  const [message, setMessage] = useState('');
  const [socketMessage, setSocketMessage] = useState('');

  useEffect(() => {
    if (me !== null) {
      socket = io('https://dev-connector-hyf.herokuapp.com/');
      // Send the email to the server
      socket.emit('user_connected', me._id);

      socket.on('new_message', (msg) => {
        setSocketMessage(msg);
      });
    }
  }, [me]);

  if (
    socketMessage &&
    socketMessage.message !== '' &&
    socketMessage.message !== ' '
  ) {
    sendMessage(socketMessage);
    setSocketMessage('');
  }
  const onSubmit = (event) => {
    event.preventDefault();

    // Send Message To The Server
    socket.emit('send_message', {
      sender: me && me._id,
      recciver: corresponderId,
      message
    });

    setMessage('');
  };
  const onChange = (e) => {
    setMessage(e.target.value);
  };
  return (
    <Form style={{ width: '99%' }} onSubmit={onSubmit}>
      <TextArea
        onChange={onChange}
        placeholder="Write Your Message"
        value={message}
      />

      <Form.Field control={Button} style={{marginTop:"1rem"}}>Submit</Form.Field>
    </Form>
  );
};

InputMessage.propTypes = {
  sendMessage: PropTypes.func.isRequired,
  corresponderId: PropTypes.string.isRequired
};

export default InputMessage;
