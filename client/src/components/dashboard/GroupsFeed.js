import React from 'react';
import { Card, Feed } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import * as uuid from "uuid";

const GroupsFeed = ({ filteredGroups, myGroupPosts }) => (
  <Card fluid>
    <Card.Content>
      <Card.Header>
        Latest posts from your groups <i className="fas fa-users m-1"></i>
      </Card.Header>
    </Card.Content>
    <Card.Content>
      <Feed>
        {filteredGroups &&
          filteredGroups.map((group) => {
            return (
              <Feed.Event key={uuid.v4()}>
                <Feed.Content>
                  <Feed.Date content={<Moment fromNow>{group.createdAt}</Moment>} />
                  { <Feed.Summary>
                    A new group named{' '}
                    <Link to={`/groups/${group._id}`}>{group.name}</Link> is
                    created by{' '}
                    <Link to={`/profile/${group.creator && group.creator._id}`}>
                      {group.creator && group.creator.name} .
                    </Link>
                  </Feed.Summary>}
                </Feed.Content>
              </Feed.Event>
            );
          })}
        {myGroupPosts &&
          myGroupPosts.map((group) => {
            return (
              <Feed.Event key={uuid.v4()}>
                <Feed.Content>
                <Feed.Date content={<Moment fromNow>{group.date}</Moment>} />
                  <Feed.Summary>
                    There is a new{' '}
                    <Link to={`/groups/${group.groupId}/posts/${group._id}`}>
                      post
                    </Link>{' '}
                    shared in your group{' '}
                    <Link to={`/groups/${group.groupId}`}>
                      {group.groupName}{' '}
                    </Link>
                    by{' '}
                    <Link to={`/profile/${group.creator}`}>{group.name}</Link>.
                  </Feed.Summary>
                </Feed.Content>
              </Feed.Event>
            );
          })}
      </Feed>
    </Card.Content>
  </Card>
);

export default GroupsFeed;
