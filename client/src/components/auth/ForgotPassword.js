import React, { useState, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { forgotPassword } from '../../actions/auth';

const ForgotPassword = ({ forgotPassword, auth }) => {
  const [email, setEmail] = useState('');
  const inputHandler = (e) => setEmail(e.target.value);
  const onSubmitHandler = async (e) => {
    console.log(email);
    e.preventDefault();
    forgotPassword(email);
  };

  return (
    <Fragment>
      <section className="container">
        <h1 className="large text-primary">Reset Your Password</h1>
        {auth && auth.msg &&<div>
          <h2>{auth.msg.message}</h2>
        </div>}
        <form className="form" onSubmit={onSubmitHandler}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email Address"
              name="email"
              onChange={inputHandler}
              value={email}
            />
          </div>
          <input
            type="submit"
            className="btn btn-primary"
            value="Send reset mail"
          />
        </form>
      </section>
    </Fragment>
  );
};
ForgotPassword.propTypes = {
  forgotPassword: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};
const mapStateToProps = (state) => ({
  auth: state.auth
});
export default connect(mapStateToProps, { forgotPassword })(ForgotPassword);
