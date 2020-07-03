import React from 'react';

const ElementNotFound = (props) => {
  return (
    <div className="flex-c flex-center fade-in">
      <i
        className="fa fa-exclamation-circle m-1"
        aria-hidden="true"
        style={{ color: '#DC3545', fontSize:"3rem" }}
      ></i>
      <span className="text text-primary large m-2">NO {props.element}</span>
    </div>
  );
};

export default ElementNotFound;
