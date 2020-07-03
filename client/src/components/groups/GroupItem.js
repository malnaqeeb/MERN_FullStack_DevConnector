import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'semantic-ui-react';

// each group item in all groups page
const GroupItem = ({ groups }) => {
  if(groups.length > 0) return (
    <section className="container">
      {groups.map((group) => {
        return (
          <div className="all-groups flex-c text-center" key={group._id}>
            <Card fluid color="teal" style={{ marginBottom: '1rem' }}>
              <Link to={`/groups/${group._id}`} className="group-link">
                <div className="group-item flex-c">
                  <h2 className="text">{group.name}</h2>
                  <p>{group.description}</p>
                </div>
                <p className="group-access">
                  {group.isPublic ? 'Public' : 'Private'}
                </p>
                <p>{group && group.members.length} { group.members.length === 1 ? `member` : `members`}</p>
              </Link>
            </Card>
          </div>
        );
      })}
    </section>
  );
};

export default GroupItem;
