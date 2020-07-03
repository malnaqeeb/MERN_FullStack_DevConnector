import React from 'react';
import { Card, Feed } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import Moment from 'react-moment'
import * as uuid from 'uuid'
const CommunityFeed = ({ filteredPosts, filteredGroupPosts }) => (
  <Card fluid>
    <Card.Content>
      <Card.Header>
        Latest posts from the community<i className="fas fa-globe m-1"></i>
      </Card.Header>
    </Card.Content>
    <Card.Content>
      <Feed>
        {filteredPosts &&
          filteredPosts.map((filteredPost) => {
            return (
              <Feed.Event key={uuid.v4()}>
                <Feed.Label image={filteredPost.avatar} />
                <Feed.Content>
                <Feed.Date content={<Moment fromNow>{filteredPost.date}</Moment>} />
                  <Feed.Summary>
                    <Link to={`/profile/${filteredPost.user}`}>
                      {filteredPost.name}
                    </Link>{' '}
                    added a new{' '}
                    <Link to={`/posts/${filteredPost._id}`}>post</Link>.
                  </Feed.Summary>
                </Feed.Content>
              </Feed.Event>
            );
          })}
        {filteredGroupPosts &&
          filteredGroupPosts.map((filteredPost) => {
            return (
              <Feed.Event key={uuid.v4()}>
                <Feed.Label image={filteredPost.avatar} />
                <Feed.Content>
                <Feed.Date content={<Moment fromNow>{filteredPost.date}</Moment>} />
                  <Feed.Summary>
                    <Link to={`/profile/${filteredPost.creator}`}>
                      {filteredPost.name}
                    </Link>{' '}
                    added a new post{' '}
                    <Link
                      to={`/groups/${filteredPost.groupId}/posts/${filteredPost._id}`}
                    >
                      {filteredPost.title}
                    </Link>{' '}
                    to the group{' '}
                    <Link to={`/groups/${filteredPost.groupId}`}>
                      {filteredPost.groupName}
                    </Link>
                  </Feed.Summary>
                </Feed.Content>
              </Feed.Event>
            );
          })}
      </Feed>
    </Card.Content>
  </Card>
);

export default CommunityFeed;
