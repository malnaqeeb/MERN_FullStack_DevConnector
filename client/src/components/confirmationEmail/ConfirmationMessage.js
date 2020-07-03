import React from 'react';
import { Header, Icon, Segment } from 'semantic-ui-react';
const ConfirmationMessage = () => {
  return (
    <Segment placeholder>
      <Header icon>
        <Icon name="mail" />
        Congratulations! You're almost set to start using DevConnector
      </Header>
      <Segment.Inline>
        <h5>
          We sent you an email, please click on the link to activate your
          account.
        </h5>
      </Segment.Inline>
    </Segment>
  );
};

export default ConfirmationMessage;
