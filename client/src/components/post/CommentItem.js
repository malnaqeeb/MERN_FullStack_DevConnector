import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { deleteComment } from '../../actions/post';
import EmojiPicker from './EmojiPicker';
import { addEmoji, removeEmoji } from '../../actions/post';

const CommentItem = ({
  postId,
  comment: { _id, text, name, avatar, user, date, emojis },
  auth,
  deleteComment,
  addEmoji,
  removeEmoji,
}) => {
  const [hideEmojiPicker, setHideEmojiPicker] = useState(true);

  const showHideEmojiPicker = () => {
    setHideEmojiPicker((prevState) => !prevState);
  };

  return (
    <div className='post bg-white p-1 my-1'>
      <div>
        <Link to={`/profile/${user}`}>
          <img className='round-img' src={avatar} alt={name} />
          <h4>{name}</h4>
        </Link>
      </div>
      <div>
        <p className='my-1'>{text}</p>
        <p className='post-date'>
          Posted on <Moment format='YYYY/MM/DD'>{date}</Moment>
        </p>
        {!auth.loading && user === auth.user._id && (
          <button
            onClick={(e) => deleteComment(postId, _id)}
            className='btn btn-danger'
          >
            <i className='fas fa-times'></i>
          </button>
        )}
        {hideEmojiPicker ? (
          <Button circular onClick={showHideEmojiPicker}>
            <span
              role='img'
              aria-label='smiling face'
              aria-labelledby='smiling face'
            >
              🙂
            </span>
          </Button>
        ) : (
          <EmojiPicker
            onBlur={showHideEmojiPicker}
            onPick={(emo) => {
              addEmoji(postId, emo, _id);
              showHideEmojiPicker();
            }}
          />
        )}
        {emojis.length > 0 && (
          <ul style={{ display: 'flex' }}>
            {emojis.map((emo, index) => (
              <li key={index}>
                <Button
                  circular
                  color={
                    !!auth &&
                    !!auth.user &&
                    !!emo.users.find((user) => {
                      return user === auth.user._id;
                    })
                      ? 'green'
                      : undefined
                  }
                  onClick={() => {
                    const isMine =
                      !!auth &&
                      !!auth.user &&
                      !!emo.users.find((user) => {
                        return user === auth.user._id;
                      });

                    if (isMine) removeEmoji(postId, emo._id, _id);
                    else addEmoji(postId, emo.emoji, _id);
                  }}
                >
                  {emo.emoji.native}
                  {emo.amount > 1 ? <small>{emo.amount}</small> : ''}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

CommentItem.propTypes = {
  auth: PropTypes.object.isRequired,
  postId: PropTypes.string.isRequired,
  comment: PropTypes.object.isRequired,
  addEmoji: PropTypes.func.isRequired,
  removeEmoji: PropTypes.func.isRequired,
};
const mapStateToProps = (state) => ({
  auth: state.auth,
});
export default connect(mapStateToProps, {
  deleteComment,
  addEmoji,
  removeEmoji,
})(CommentItem);
