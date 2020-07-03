import React, { useEffect, Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { Link, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { ReactTinyLink } from 'react-tiny-link';
import EventCalendar from './EventCalendar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
  getGroup,
  addEvent,
  deleteEvent,
  addMember,
  removeMember,
  addGroupPost
} from '../../actions/group';
import GroupOwnerDashboard from './GroupOwnerDashboard';
import Spinner from '../layout/Spinner';
import ElementNotFound from '../layout/ElementNotFound';

// detailed view of single group

const GroupDetails = ({
  getGroup,
  addMember,
  removeMember,
  addGroupPost,
  addEvent,
  deleteEvent,
  group: { group, loading },
  match,
  auth
}) => {
  const { groupID } = useParams();
  useEffect(() => {
    getGroup(match.params.groupID);
  }, [getGroup, match]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [discussionOpen, setDiscussionOpen] = useState(false);

  const isFinished = (eventEndDate) => {
    const d = new Date();
    const ed = new Date(eventEndDate).getTime();
    const nowValue = new Date(d).getTime();
    const difference = ed - nowValue;
    if (difference < 0) {
      return true;
    } else return false;
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };
  const [addLink, setAddLink] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    link: ''
  });
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    place: ''
  });
  const onChangeEvent = (e) => {
    setEventData({
      ...eventData,
      [e.target.name]: e.target.value
    });
  };
  const { title, text, link } = formData;
  const onChangeInputHandler = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmitHandler = (e, groupID, formData) => {
    e.preventDefault();
    addGroupPost(groupID, formData);
    setFormData({
      title: '',
      text: '',
      link: ''
    });
  };
  const isMember = (group, userID) => {
    if (
      group.members.filter((member) => member.user === userID).length !== 0 ||
      group.members.filter((member) => member.user._id === userID).length !== 0
    ) {
      return true;
    } else return false;
  };
  if (loading || auth.loading) return <Spinner />;
  if (!loading && group === null) return <ElementNotFound element="GROUP" />;
  return (
    <section className="container">
      {/* Container including group info */}
      <div
        className="p-3 my-1 flex-r group-info-container"
        style={{ justifyContent: 'space-between' }}
      >
        <div className="flex-c group-info">
          <span className="text-primary large text-white">
            {group && group.name}
          </span>
          <span>
            <strong>Description:</strong> {group && group.description}
          </span>
          <span>
            <strong>Active since:</strong>{' '}
            {group && <Moment format="YYYY/MM/DD">{group.createdAt}</Moment>}
          </span>
          <span>
            {group && group.creator && (
              <Fragment>
                <strong>Creator:</strong>
                <Link
                  to={`/profile/${group.creator._id}`}
                  className="text-white"
                >
                  {!loading && group && group.creator && group.creator.name}
                </Link>
              </Fragment>
            )}
          </span>
        </div>
        <div className="group-buttons">
          {group &&
          auth &&
          !auth.loading &&
          group.members &&
          isMember(group, auth.user._id) ? (
            <button
              className="btn btn-danger m-1 mobile-button-m0"
              onClick={() => removeMember(groupID)}
            >
              LEAVE
            </button>
          ) : (
            <button
              className="btn btn-success m-1 mobile-button-m0"
              onClick={() => addMember(groupID)}
            >
              JOIN
            </button>
          )}
          {/* Button that toggle between settings for the creator of the group */}
          {group &&
            group.creator &&
            auth &&
            !auth.loading &&
            auth.user._id === group.creator._id && (
              <button
                className="btn btn-dark m-1 mobile-button-m0"
                onClick={() => toggleSettings()}
              >
                {settingsOpen ? 'CLOSE' : 'SETTINGS'}
              </button>
            )}
        </div>
      </div>
      {/* Settings component for authorized user(toggle) */}
      <div className={settingsOpen ? `shown` : `hidden`}>
        {group && <GroupOwnerDashboard isPublic={group.isPublic} />}
      </div>
      <h1 className="lead text-center large">
        <i className="fas fa-user"></i> Welcome to {group && group.name}
      </h1>
      {group &&
        !group.isPublic &&
        auth &&
        !auth.loading &&
        !isMember(group, auth.user._id) && (
          <div className="bg-white">
            <h2 className="bg-light text-center p-3">
              If you want to see the posts, join the group
            </h2>
          </div>
        )}
      {group &&
        auth &&
        !auth.loading &&
        (group.isPublic || isMember(group, auth.user._id)) && (
          <div className="text-center m-2">
            <button className="btn btn-light my">
              <a href="#discussions">Discussions</a>
            </button>
            <button className="btn btn-light my">
              <a href="#member-list">Members</a>
            </button>
            <button className="btn btn-light my">
              <a href="#events">Events</a>
            </button>
          </div>
        )}
      <div className="ui divider"></div>
      <div id="member-list" className="text-center m-3">
        <h3 className="text text-center text-primary m-3">Members:</h3>{' '}
        {group && group.members.length === 0 && (
          <ElementNotFound element="MEMBERS" />
        )}
        {group &&
          group.members.map((member) => (
            <div key={member.user._id}>
              <Link
                to={`/profile/${member.user._id}`}
                className="flex-r"
                style={{ justifyContent: 'flex-start', alignItems: 'center' }}
              >
                <img
                  src={member.user.avatar || member.avatar}
                  style={{ width: '10%' }}
                  className="round-img m-1"
                  alt="avatar"
                />
                <p>{member.user.name || member.name} </p>
              </Link>
            </div>
          ))}
      </div>
      {/* Group Posts(form and previous posts) */}
      <div className="ui divider"></div>
      {group &&
        auth &&
        !auth.loading &&
        (group.isPublic || isMember(group, auth.user._id)) && (
          <Fragment>
            <h3 className="text-primary text-center m-2" id="discussions">
              Group Discussions
            </h3>
            <div className="post-form">
              <div className="text-center bg-primary p">
                <h3
                  onClick={() => setDiscussionOpen(!discussionOpen)}
                  style={{ cursor: 'pointer' }}
                >
                  {' '}
                  <i className="fas fa-comments"></i>{' '}
                  {discussionOpen ? `Close` : `Click to start a discussion`}{' '}
                </h3>
              </div>
              <form
                className={discussionOpen ? `form my-1` : `hidden`}
                onSubmit={(e) =>
                  onSubmitHandler(e, match.params.groupID, formData)
                }
              >
                <input
                  style={{ margin: '1rem 0' }}
                  name="title"
                  value={title}
                  type="text"
                  onChange={onChangeInputHandler}
                  placeholder="Please provide a title"
                ></input>
                <textarea
                  name="text"
                  value={text}
                  cols="30"
                  rows="5"
                  placeholder="Create a post"
                  onChange={onChangeInputHandler}
                  required
                ></textarea>
                <span
                  className=" text-primary m-1 link-button"
                  onClick={() => {
                    setAddLink(!addLink);
                  }}
                >
                  <i className="fas fa-paperclip"></i>
                </span>
                <div className={addLink ? `shown` : `hidden`}>
                  <input
                    type="text"
                    name="link"
                    value={link}
                    placeholder="Add a link"
                    onChange={onChangeInputHandler}
                  />
                </div>
                <input
                  type="submit"
                  className="btn btn-dark my-1"
                  value="Submit"
                />
              </form>
            </div>
            <div className="posts">
              <div className="post bg-white p-1 my-1 flex-c">
                {group && group.posts.length === 0 ? (
                  <ElementNotFound element="POSTS SHARED" />
                ) : (
                  <div>
                    {group &&
                      group.posts.map((post) => (
                        <div className="m-2" key={post._id}>
                          <h3>{post.title}</h3>
                          <p>{post.text}</p>
                          {post.link && post.link !== '' && !loading && (
                            <ReactTinyLink
                              cardSize="large"
                              showGraphic={true}
                              maxLine={2}
                              minLine={1}
                              url={post.link}
                            />
                          )}{' '}
                          <p className="post-date m-1">
                            Posted on{' '}
                            <Moment format="YYYY/MM/DD">{post.date}</Moment>
                          </p>
                          <Link to={`/groups/${groupID}/posts/${post._id}`}>
                            <span className="btn btn-primary">
                              Discussion{' '}
                              <span className="comment-count">
                                {post.comments.length}
                              </span>
                            </span>
                          </Link>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
            <div className="ui divider"></div>
            {/* Events */}
            <div id="events">
              <button
                className="btn btn-primary"
                style={{
                  marginTop: '1.5rem',
                  width: '100%',
                  marginBottom: '1rem'
                }}
                onClick={() => setAddEventOpen(!addEventOpen)}
              >
                {addEventOpen ? 'CLOSE' : 'ADD AN EVENT'}
              </button>
              <div className={addEventOpen ? `add-event` : `hidden`}>
                <h3 style={{ marginTop: '1rem' }}>Add an event</h3>
                <form className="form">
                  <input
                    onChange={onChangeEvent}
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={eventData.title}
                  ></input>
                  <textarea
                    onChange={onChangeEvent}
                    type="text"
                    name="description"
                    placeholder="Please provide a description"
                    value={eventData.description}
                  ></textarea>
                  <input
                    onChange={onChangeEvent}
                    type="text"
                    name="place"
                    placeholder="Place"
                    value={eventData.place}
                  ></input>
                  <small className="form-text">Start of the event</small>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => {
                      setStartDate(date);
                    }}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    dateFormatCalendar={'MMM yyyy'}
                    showMonthDropdown
                  />
                  <small className="form-text">End of the event</small>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => {
                      setEndDate(date);
                    }}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    showMonthDropdown
                    dateFormatCalendar={'MMM yyyy'}
                  />
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      onClick={() => {
                        addEvent(groupID, {
                          ...eventData,
                          start: startDate,
                          end: endDate
                        });
                      }}
                      className="btn btn-dark"
                    >
                      ADD
                    </button>
                  </div>
                </form>
              </div>
              <div className="events-list">
                <h3 className="text text-primary text-center">Events</h3>
                {group.events.length === 0 && (
                  <ElementNotFound element="EVENTS" />
                )}
                {group && auth && !loading && (
                  <EventCalendar
                    events={group.events}
                    deleteEvent={deleteEvent}
                    groupID={groupID}
                    isFinished={isFinished}
                    auth={auth}
                  />
                )}
              </div>
            </div>
          </Fragment>
        )}
    </section>
  );
};
GroupDetails.propTypes = {
  getGroup: PropTypes.func.isRequired,
  addMember: PropTypes.func.isRequired,
  removeMember: PropTypes.func.isRequired,
  group: PropTypes.object.isRequired,
  members: PropTypes.array,
  auth: PropTypes.object.isRequired,
  addGroupPost: PropTypes.func.isRequired,
  addEvent: PropTypes.func.isRequired,
  deleteEvent: PropTypes.func.isRequired
};
const mapStateToProps = (state) => ({
  group: state.group,
  members: state.group.members,
  events: state.group.events,
  auth: state.auth
});

export default connect(mapStateToProps, {
  getGroup,
  addEvent,
  deleteEvent,
  addMember,
  removeMember,
  addGroupPost
})(GroupDetails);
