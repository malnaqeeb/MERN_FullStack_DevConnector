import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const Landing = ({ isAuthenticated }) => {
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <section className="landing">
      <div className="dark-overlay">
        <div className="landing-inner">
          <h1 className="x-large">Developer Connector</h1>
          <p className="lead">
            Create a developer profile/portfolio, share posts and get help from
            other developers
          </p>
          <div className="buttons">
            <Link to="/register" className="btn btn-primary">
              Sign Up
            </Link>
            <Link to="/login" className="btn btn-light">
              Login
            </Link>
          </div>
          <div className="m-2 social-buttons">
            <a href="https://dev-connector-hyf.herokuapp.com/api/social/facebook">
              <button className="btn btn-light my" style={{color:"#0D8AF0",}}>
                <i className="fab fa-facebook-square"></i>
              </button>
            </a>
            <a href="https://dev-connector-hyf.herokuapp.com/api/social/google">
              <button className="btn btn-light my" style={{background:"#D5453A", color:"white"}}>
                <i className="fab fa-google-plus-square"></i>
              </button>
            </a>
            <a href="https://dev-connector-hyf.herokuapp.com/api/social/github">
              <button className="btn btn-light my">
                <i className="fab fa-github-square"></i>
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

Landing.propTypes = {
  isAuthenticated: PropTypes.bool
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps)(Landing);
