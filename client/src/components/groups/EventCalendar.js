import React from 'react';
import './EventCalendar.css';
import Moment from 'react-moment';

const EventCalendar = ({ events, deleteEvent, groupID, isFinished, auth }) => {
  return (
    <div className="event-container">
      {events &&
        events.map((event) => {
          return (
            <div className="event-item" key={event._id}>
              <div
                className={
                  event.end && isFinished(event.end)
                    ? `event-finished`
                    : `hidden`
                }
              >
                <span> &#10004;</span>
              </div>
              <div className="p-1">
                <i
                  className="fas fa-thumbtack"
                  style={{ transform: 'rotate(-20deg)' }}
                ></i>
                <div className="flex-c flex-center">
                  <h4>{event && event.title}</h4>
                  <p>
                    <strong>Description</strong> {event && event.description}
                  </p>
                  <p>
                    <strong>Place:</strong> {event.place}{' '}
                  </p>
                  <p>
                    <strong>Start:</strong>{' '}
                    <Moment format="DD/MM/YY">{event.start}</Moment>
                  </p>
                  <p>
                    <strong>End:</strong>{' '}
                    <Moment format="DD/MM/YY">{event.end}</Moment>
                  </p>
                </div>
                {event.creator === auth.user._id && (
                  <div
                    className="delete-button"
                    onClick={() => deleteEvent(groupID, event._id)}
                  >
                    &#215;
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default EventCalendar;
