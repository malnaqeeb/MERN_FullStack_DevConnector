import React from 'react';
import { Card, Feed } from 'semantic-ui-react';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import * as uuid from 'uuid';

const FriendsFeed = ({ friends, filteredFriendPosts, dateChecker }) => {
  let latestFriendPosts = [];
  filteredFriendPosts.forEach((post) => {
    const postDate = new Date(post.date).getTime();
    const difference = dateChecker(postDate);
    if (difference < 172800000) {
      latestFriendPosts.push(post);
    }
  });

  return (
    <Card fluid>
      <Card.Content>
        <Card.Header>
          Latest posts from your friends{' '}
          <i className="fas fa-user-friends m-1"></i>
        </Card.Header>
      </Card.Content>
      <Card.Content>
        <Feed>
          {friends &&
            friends.map((friend) => (
              <Feed.Event key={uuid.v4()}>
                <Feed.Label image={friend.avatar} />
                <Feed.Content>
                  <Feed.Date content="1 day ago" />
                  <Feed.Summary>
                    You and <a href={`/profile/${friend._id}`}>{friend.name}</a> are friends now.
                  </Feed.Summary>
                </Feed.Content>
              </Feed.Event>
            ))}
        </Feed>
        <Feed>
          {latestFriendPosts &&
            latestFriendPosts.map((post) => {
              return (
                <Feed.Event key={uuid.v4()}>
                  <Feed.Label image={post.avatar} />
                  <Feed.Content>
                    <Feed.Date content={<Moment fromNow>{post.date}</Moment>} />
                    <Feed.Summary>
                      Your friend{' '}
                      <Link to={`/profile/${post.user._id}`}>{post.name}</Link>{' '}
                      shared a new <Link to={`/posts/${post._id}`}>post</Link>
                    </Feed.Summary>
                  </Feed.Content>
                </Feed.Event>
              );
            })}
        </Feed>
      </Card.Content>
    </Card>
  );
};

export default FriendsFeed;
