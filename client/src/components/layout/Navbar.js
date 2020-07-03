import React, { Fragment, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { logout } from '../../actions/auth';
import { fetchContacts } from '../../actions/message';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import Notification from '../notification/Notification';
let socket;
const Navbar = ({
  auth: { isAuthenticated, loading, user },
  logout,
  fetchContacts
}) => {
  const authLinks = (
    <ul>
      <li>
        <NavLink to="/profiles">Developers</NavLink>
      </li>
      <li>
        <Notification />
      </li>
      <li>
        <NavLink to="/posts">Posts</NavLink>
      </li>
      <li>
        {' '}
        <NavLink to="/friends">
          <i className="fas fa-user-friends" />{' '}
          <span className="hide-sm hide-medium"> Friends</span>
        </NavLink>
      </li>
      <li></li>
      <li>
        <NavLink to="/groups">Groups</NavLink>
      </li>
      <li>
        {' '}
        <NavLink to="/dashboard">
          <i className="fas fa-user"></i>{' '}
          <span className="hide-sm hide-medium">Dashboard </span>
        </NavLink>
      </li>
      <li>
        <a onClick={logout} href="/">
          <i className="fas fa-sign-out-alt"></i>{' '}
          <span className="hide-sm hide-medium">Logout </span>
        </a>
      </li>
      <li>
        <NavLink to="/search">
          <i className="fas fa-search"></i>
        </NavLink>
      </li>
    </ul>
  );
  const guestLinks = (
    <ul>
      <li>
        <NavLink to="/profiles">Developers</NavLink>
      </li>
      <li>
        <NavLink to="/register">Register</NavLink>
      </li>
      <li>
        <NavLink to="/login">Login</NavLink>
      </li>
    </ul>
  );
  useEffect(() => {
    if (user) {
      socket = io('https://dev-connector-hyf.herokuapp.com/');
      // Send the email to the server
      socket.emit('user_connected', user._id);
      fetchContacts();
    }
  }, [user, fetchContacts]);

  return (
    <nav className="navbar bg-dark">
      <h1>
        <NavLink to="/">
          <i className="fas fa-code"></i> DevConnector
        </NavLink>
      </h1>
      {!loading && (
        <Fragment>{isAuthenticated ? authLinks : guestLinks}</Fragment>
      )}
    </nav>
  );
};
Navbar.propTypes = {
  logout: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};
const mapStateToProps = (state) => ({
  auth: state.auth,
  message: state.message
});
export default connect(mapStateToProps, {
  logout,
  fetchContacts
})(Navbar);
