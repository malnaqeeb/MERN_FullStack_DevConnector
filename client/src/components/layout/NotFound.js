import React, { Fragment } from 'react';

function NotFound() {
  return (
    <Fragment>
      <h2 className='x-large text-primary'>
        <i className='fas fa-exclamation-triangle'></i>Page Not Found
      </h2>
      <p className='large'>Sorry, this page does not exist</p>
    </Fragment>
  );
}

export default NotFound;
