import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { confirmAccount } from '../../actions/auth';

const ConfirmationEmail = ({ confirmAccount }) => {
  const token = useParams().token;

  useEffect(() => {
    confirmAccount(token);
  }, [confirmAccount, token]);

  return <Redirect to="/login" />;
};
const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated
});
export default connect(mapStateToProps, { confirmAccount })(ConfirmationEmail);
