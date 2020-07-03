import React, { useEffect, Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Dropdown, List } from 'semantic-ui-react';
import {
  getNotifications,
  deleteNotifications
} from '../../actions/notification';
import NotificationItem from './NotificationItem';
const Notification = ({
  getNotifications,
  notification: { notifications, loading },
  deleteNotifications
}) => {
  useEffect(() => {
    getNotifications();
  }, [getNotifications]);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <Fragment>
      <span className="notifications_count">
        {notifications &&
          !loading &&
          notifications.length > 0 &&
          notifications.length}
      </span>
      <Dropdown
        icon="globe"
        open={notifications && notifications.length === 0 ? false : menuOpen}
        onClick={() => {
          setMenuOpen(!menuOpen);
        }}
      >
        <Dropdown.Menu size="massive">
          <List celled>
            {notifications &&
              !loading &&
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  deleteNotifications={deleteNotifications}
                />
              ))}
          </List>
        </Dropdown.Menu>
      </Dropdown>
    </Fragment>
  );
};

Notification.propTypes = {
  getNotifications: PropTypes.func.isRequired,
  deleteNotifications: PropTypes.func.isRequired
};
const mapStateToProps = (state) => ({
  notification: state.notification
});
export default connect(mapStateToProps, {
  getNotifications,
  deleteNotifications
})(Notification);
