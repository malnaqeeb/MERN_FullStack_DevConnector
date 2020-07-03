import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateUser, setPrivacyOptions } from '../../actions/profile';
import { useHistory } from 'react-router-dom';
import { Form, Input, Image, Header, Icon, Radio } from 'semantic-ui-react';
const EditUserInfo = ({ updateUser, auth, setPrivacyOptions }) => {
  const history = useHistory();
  const [userInfo, setUserInfo] = useState({
    avatar: '',
    name: auth.user && auth.user.name
  });

  const [messages, setMessages] = useState();
  const [profileVisibility, setProfileVisibility] = useState();

  const [mediaPreview, setMediaPreview] = useState('');
  const { avatar, name } = userInfo;
  const onChangeHandler = (e) => {
    if (e.target.name === 'avatar') {
      setUserInfo({ ...userInfo, avatar: e.target.files[0] });
      setMediaPreview(window.URL.createObjectURL(e.target.files[0]));
    } else {
      setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    }
  };
  const onSubmitHandler = (e) => {
    e.preventDefault();
    updateUser(avatar, name, undefined);
    history.push('/dashboard');
  };

  return (
    <Fragment>
      <Form onSubmit={onSubmitHandler}>
        <Header as="h2" block>
          <Icon name="edit" color="grey" />
          Update User
        </Header>
        <Form.Group>
          <Form.Field
            control={Input}
            type="text"
            name="name"
            label="Name"
            placeholder="Name"
            onChange={onChangeHandler}
            value={name}
          />
          <Form.Field
            control={Input}
            type="file"
            content="Select Image"
            onChange={onChangeHandler}
            name="avatar"
            label="Avatar"
            accept="image/*"
          />
        </Form.Group>
        {mediaPreview && (
          <Image src={mediaPreview} rounded centered size="medium" />
        )}
        <input
          className="btn btn-primary my-1"
          color="teal"
          icon="pencil alternate"
          content="Submit"
          type="submit"
        />
      </Form>
      <Radio
        toggle
        label={
          auth.user && auth.user.notifications
            ? 'TURN OFF EMAIL NOTIFICATION'
            : 'TURN ON EMAIL NOTIFICATION'
        }
        checked={auth.user && auth.user.notifications}
        onChange={(e) => {
          updateUser(
            undefined,
            undefined,
            auth.user && !auth.user.notifications
          );
        }}
      />
      {auth.user && (
        <div className="flex-c" style={{ width: '30%', marginTop: '1rem' }}>
          <span>Choose who can send you messages</span>
          <select
            className="ui dropdown"
            onChange={(e) => setMessages(e.target.value)}
          >
            {' '}
            <option value="null">Select</option>
            <option value={false}>Friends Only</option>
            <option value={true}>Everyone</option>
          </select>
          <span>Choose who can see your profile</span>
          <select
            className="ui dropdown"
            onChange={(e) => setProfileVisibility(e.target.value)}
          >
            {' '}
            <option value="null">Select</option>
            <option value={false}>Friends Only</option>
            <option value={true}>Everyone</option>
          </select>
          <button
            className="btn btn-primary"
            onClick={() => {
              setPrivacyOptions(messages, profileVisibility);
            }}
          >
            SAVE
          </button>
        </div>
      )}
    </Fragment>
  );
};

EditUserInfo.propTypes = {
  updateUser: PropTypes.func.isRequired,
  setPrivacyOptions: PropTypes.func.isRequired
};
const mapStateToProps = (state) => ({
  auth: state.auth
});
export default connect(mapStateToProps, { updateUser, setPrivacyOptions })(
  EditUserInfo
);
