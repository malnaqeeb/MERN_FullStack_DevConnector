import React, { useEffect, Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { getGroups } from '../../actions/group';
import { connect } from 'react-redux';
import GroupItem from './GroupItem';
import GroupsForm from './GroupsForm';
import Spinner from '../layout/Spinner';
import ElementNotFound from '../layout/ElementNotFound';

const Groups = ({ getGroups, group: { groups, loading } }) => {
  useEffect(() => {
    getGroups();
  }, [getGroups]);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  if (loading) return <Spinner />;
  return (
    <Fragment>
      <div className="text-center">
        {!createGroupOpen && (
          <button
            className="btn btn-dark"
            style={{ margin: '0' }}
            onClick={() => {
              setCreateGroupOpen(true);
            }}
          >
            Create a group
          </button>
        )}
        {createGroupOpen && (
          <div className="group-create">
            <GroupsForm setCreateGroupOpen={setCreateGroupOpen} />
            <button
              className="btn btn-dark"
              onClick={() => setCreateGroupOpen(false)}
            >
              CLOSE
            </button>
          </div>
        )}
      </div>

      {!loading && groups && groups.length === 0 ? (
        <ElementNotFound element="GROUPS"/>
      ) : (
        <GroupItem groups={groups} />
      )}
    </Fragment>
  );
};
Groups.propTypes = {
  getGroups: PropTypes.func.isRequired,
  group: PropTypes.object.isRequired,
};
const mapStateToProps = (state) => ({
  group: state.group
});
export default connect(mapStateToProps, { getGroups })(Groups);
