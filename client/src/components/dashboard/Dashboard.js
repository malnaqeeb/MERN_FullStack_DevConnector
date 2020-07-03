import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { loadUser } from '../../actions/auth';
import { getPosts } from '../../actions/post';
import { getGroups } from '../../actions/group';
import { getFriendsList } from '../../actions/friends';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import GroupsFeed from './GroupsFeed';
import FriendsFeed from './FriendsFeed';
import CommunityFeed from './CommunityFeed';
import { Card } from 'semantic-ui-react';
import * as uuid from 'uuid';

const Dashboard = ({
  loadUser,
  auth: { user, loading },
  getPosts,
  post: { posts },
  getGroups,
  group: { groups },
  getFriendsList,
  friendsObject: { friends }
}) => {
  useEffect(() => {
    loadUser();
  }, [loadUser]);
  useEffect(() => {
    getPosts();
  }, [getPosts]);
  useEffect(() => {
    getGroups();
  }, [getGroups]);
  useEffect(() => {
    getFriendsList();
  }, [getFriendsList]);

  const [isGroupsOpen, setGroupsOpen] = useState(false);

  const dateChecker = (postDate) => {
    const d = new Date();
    const s = new Date(d).getTime();
    const difference = s - postDate;
    return difference;
  };
  let myGroupPosts = [];
  if (user && user.myGroups) {
    user.myGroups.forEach((group) => {
      group._id.posts.forEach((post) => {
        const postDate = new Date(post.date).getTime();
        const difference = dateChecker(postDate);
        if (difference < 172800000) {
          post.groupName = group._id.name;
          post.groupId = group._id._id;
          myGroupPosts.push(post);
        }
      });
    });
  }

  let filteredGroups = [];
  if (groups) {
    groups.forEach((group) => {
      const groupDate = new Date(group.createdAt).getTime();
      const difference = dateChecker(groupDate);
      if (difference < 172800000) {
        filteredGroups.push(group);
      }
    });
  }

  let filteredGroupPosts = [];
  if (groups) {
    groups.forEach((group) => {
      group.posts.forEach((groupPost) => {
        const postDate = new Date(groupPost.date).getTime();
        const difference = dateChecker(postDate);
        if (difference < 172800000) {
          groupPost.groupName = group.name;
          groupPost.groupId = group._id;
          filteredGroupPosts.push(groupPost);
        } else return;
      });
    });
  }

  let filteredPosts = [];
  if (posts) {
    posts.forEach((post) => {
      const postDate = new Date(post.date).getTime();
      const difference = dateChecker(postDate);
      if (difference < 172800000) {
        filteredPosts.push(post);
      }
    });
  }

  let filteredFriendPosts = [];
  if (posts && user) {
    posts.forEach((post) => {
      if (user && post && post.user) {
        if (user.friends.includes(post.user._id)) {
          filteredFriendPosts.push(post);
        }
        return;
      }
      return;
    });
  }

  if (loading) return <Spinner />;
  return (
    <section className="container">
      {user && (
        <Fragment>
          <div className="flex-r dashboard-container">
            <div className="flex-c dashboard-profile">
              <Card fluid>
                <div className="flex-c">
                  <img src={user.avatar} alt="avatar" />
                  <span
                    className="text-primary p-1"
                    style={{ fontSize: '1.5rem' }}
                  >
                    {user.name}
                  </span>
                  <span className="text-dark">
                    Member since: <Moment format="YY/MM/DD">{user.date}</Moment>
                  </span>
                </div>
                <div className="m-1">
                  <h4
                    onClick={() => {
                      setGroupsOpen(!isGroupsOpen);
                    }}
                  >
                    My Groups
                  </h4>
                  <div className={isGroupsOpen ? `shown` : `mobile-hidden`}>
                    {user &&
                      user.myGroups.map((group) => {
                        return (
                          <div key={uuid.v4()}>
                            <Link to={`/groups/${group._id._id}`}>
                              {group._id.name}
                            </Link>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className="m-1">
                  <h4
                    onClick={() => {
                      setGroupsOpen(true);
                    }}
                  >
                    My Friends
                  </h4>
                  <div className="flex-c">
                    {friends &&
                      friends.map((friend) => (
                        <Link to={`profile/${friend.id}`} key={friend.id}>
                          {friend.name}
                        </Link>
                      ))}
                  </div>
                </div>
                <Link to={`/settings`}>
                  {' '}
                  <button className="btn btn-light settings-button">
                    <i className="fas fa-users-cog settings-icon"></i>SETTINGS
                  </button>
                </Link>
                <Link to={`/message/all`}>
                  <button className="btn btn-light settings-button">
                    <i className="fa fa-envelope" aria-hidden="true"></i>MY MESSAGES
                  </button>
                </Link>
              </Card>
            </div>
            <div className="flex-c newsfeed-container">
              <div className="flex-r newsfeed flex-center">
                <Card.Group>
                  <FriendsFeed
                    friends={friends}
                    filteredFriendPosts={filteredFriendPosts}
                    dateChecker={dateChecker}
                  />
                  {myGroupPosts && filteredGroups && (
                    <GroupsFeed
                      myGroupPosts={myGroupPosts}
                      filteredGroups={filteredGroups}
                    />
                  )}
                  {filteredPosts && filteredGroupPosts && (
                    <CommunityFeed
                      filteredPosts={filteredPosts}
                      filteredGroupPosts={filteredGroupPosts}
                    />
                  )}
                </Card.Group>
              </div>
            </div>
          </div>
        </Fragment>
      )}
    </section>
  );
};

Dashboard.propTypes = {
  loadUser: PropTypes.func.isRequired,
  getPosts: PropTypes.func.isRequired,
  getGroups: PropTypes.func.isRequired,
  getFriendsList: PropTypes.func.isRequired,
  group: PropTypes.object.isRequired,
  post: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  friendsObject: PropTypes.object.isRequired
};
const mapStateToProps = (state) => ({
  auth: state.auth,
  post: state.post,
  group: state.group,
  friendsObject: state.friendsObject
});

export default connect(mapStateToProps, {
  loadUser,
  getPosts,
  getGroups,
  getFriendsList
})(Dashboard);
