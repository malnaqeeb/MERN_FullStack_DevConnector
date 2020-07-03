import React, { useState, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { resetPassword } from '../../actions/auth';
import { Link } from 'react-router-dom';

const ResetPassword = ({ resetPassword, auth }) => {
  const token = new URL(window.location).searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sent, setSent] = useState(false);
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    resetPassword(password, confirmPassword, token);
    setSent(true);
  };
  if (sent && auth && auth.msg) {
    return (
      <div className="text-center">
        <h1 className="text-primary text-center">{auth.msg.message}</h1>
        <button className="btn btn-light">
          <Link to="/login">LOGIN</Link>
        </button>
      </div>
    );
  }
  return (
    <Fragment>
      <section className="container">
        <h1 className="large text-primary">Reset Your Password</h1>
        <form className="form" onSubmit={onSubmitHandler}>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              name="password"
              required
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              value={password}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              name="confirm-password"
              required
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
              value={confirmPassword}
            />
          </div>
          <input
            type="submit"
            className="btn btn-primary"
            value="Reset Your Password"
          />
        </form>
      </section>
    </Fragment>
  );
};
ResetPassword.propTypes = {
  resetPassword: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};
const mapStateToProps = (state) => ({
  auth: state.auth
});
export default connect(mapStateToProps, { resetPassword })(ResetPassword);
