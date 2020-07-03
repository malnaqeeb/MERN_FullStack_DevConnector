import React, { useState, Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { login, socialLogin } from '../../actions/auth';
import { Link, Redirect } from 'react-router-dom';
const Login = ({ login, isAuthenticated, socialLogin }) => {
  useEffect(() => {
    const token = new URL(window.location).searchParams.get('token');
    socialLogin(token);
  }, [socialLogin]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { email, password } = formData;
  const inputHandler = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    login(email, password);
  };
  // Rediract if logged in
  if (isAuthenticated) {
    return <Redirect to='/dashboard' />;
  }
  return (
    <Fragment>
      <section className='container'>
        <h1 className='large text-primary'>Sign In</h1>
        <p className='lead'>
          <i className='fas fa-user'></i> Sign into Your Account
        </p>
        <form className='form' onSubmit={onSubmitHandler}>
          <div className='form-group'>
            <input
              type='email'
              placeholder='Email Address'
              name='email'
              onChange={inputHandler}
              value={email}
            />
          </div>
          <div className='form-group'>
            <input
              type='password'
              placeholder='Password'
              name='password'
              minLength='6'
              onChange={inputHandler}
              value={password}
            />
          </div>

          <input type='submit' className='btn btn-primary' value='Login' />
        </form>
        <p className='my-1'>
          <Link to='/forgotpassword'>Forgot Password</Link>
        </p>
        <p className='my-1'>
          Don't have an account? <Link to='/register'>Sign Up</Link>
        </p>
      </section>
    </Fragment>
  );
};
Login.propTypes = {
  login: PropTypes.func.isRequired,
  socialLogin: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};
const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});
export default connect(mapStateToProps, { login, socialLogin })(Login);
