import React from 'react';

import { Image, List, Icon } from 'semantic-ui-react';
const NotificationItem = ({ notification, deleteNotifications }) => {
  let path;
  switch (notification.kind) {
    case 'message':
      path = `/message/${notification.sender._id}`;
      break;
    case 'post in group':
      path = `/groups/${notification.path}`;
      break;
    case 'join group':
      path = `/groups/${notification.path}`;
      break;
    case 'left group':
      path = `/groups/${notification.path}`;
      break;
    case 'add event':
      path = `/groups/${notification.path}`;
      break;
    case 'add comment post group':
      path = `/groups/${notification.path}`;
      break;
    case 'friend request':
      path = notification.path;
      break;
    case 'like post':
      path = notification.path;
      break;
    case 'add comment':
      path = notification.path;
      break;
    default:
      path = '/profiles';
      break;
  }
  const message = notification.message.slice(0, 50);

  return (
    <List.Item>
      <Image avatar src={notification.sender.avatar} />
      <List.Content>
        <List.Header as="a" href={path}>
          {notification.sender.name}
        </List.Header>

        <List.Description className="desc-mobile">
          {`${message.length >= 45 ? `${message}...` : message}`}
          <Icon
            name="delete"
            className="delete-icon-notification"
            onClick={(e) => deleteNotifications(notification._id)}
          />
        </List.Description>
      </List.Content>
    </List.Item>
  );
};

export default NotificationItem;
