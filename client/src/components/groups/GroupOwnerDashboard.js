import React, { useState } from 'react';
import { withRouter, useHistory, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateGroup, deleteGroup } from '../../actions/group';

const GroupOwnerDashboard = ({ updateGroup, deleteGroup, isPublic, match }) => {
  const history = useHistory();
  const { groupID } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: isPublic
  });
  const { name, description } = formData;
  const onChangeInputHandler = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <section className="container">
      <h1 className="large text-primary">Update Settings</h1>

      <small>* = required field</small>
      <form className="form">
        <div className="form-group">
          <select name="isPublic" onChange={onChangeInputHandler}>
            <option value={true}>Public(everyone)</option>
            <option value={false}>Private(only members)</option>
          </select>
          <small className="form-text">
            Choose who can see posts in your group
          </small>
        </div>
        <div className="form-group">
          <input
            type="text"
            onChange={onChangeInputHandler}
            placeholder="Name"
            name="name"
            value={name}
          />
          <small className="form-text">Name</small>
        </div>
        <div className="form-group">
          <textarea
            placeholder="A short description about the group"
            name="description"
            value={description}
            onChange={onChangeInputHandler}
          ></textarea>
          <small className="form-text">Description</small>
        </div>
        <div>
          <button
            className="btn btn-primary"
            onClick={() => {
              updateGroup(match.params.groupID, formData);
            }}
          >
            UPDATE
          </button>
        </div>
      </form>
      <div className="flex-c" style={{ margin: '1rem 0' }}>
        <small className="form-text">
          Are you sure you want to delete the group with all the posts?
        </small>
        <button
          className="btn btn-danger center"
          style={{ width: '12rem' }}
          onClick={() => {
            setModalOpen(true);
          }}
        >
          DELETE THE GROUP
        </button>
        <div className={modalOpen ? `shown` : `hidden`}>
          <p>Do you want to proceed and delete the group?</p>
          <button
            className="btn btn-danger"
            onClick={() => {
              deleteGroup(groupID);
              history.push('/groups');
            }}
          >
            DELETE
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setModalOpen(false)}
          >
            CANCEL
          </button>
        </div>
      </div>
    </section>
  );
};

GroupOwnerDashboard.propTypes = {
  updateGroup: PropTypes.func.isRequired,
  deleteGroup: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  group: state.group
});

export default connect(mapStateToProps, { updateGroup, deleteGroup })(
  withRouter(GroupOwnerDashboard)
);
