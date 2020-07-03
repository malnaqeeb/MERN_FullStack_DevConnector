import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import Moment from 'react-moment';
import {ReactTinyLink} from 'react-tiny-link';
import { connect } from 'react-redux';
import {
  addLike,
  removeLike,
  deletePost,
  addEmoji,
  removeEmoji
} from '../../actions/post';
import Spinner from '../layout/Spinner';
import EmojiPicker from '../post/EmojiPicker';
const PostItem = ({
  addLike,
  removeLike,
  deletePost,
  auth,
  post: {
    _id,
    text,
    name,
    link,
    avatar,
    user,
    likes,
    comments,
    date,
    loading,
    emojis
  },
  showActions,
  addEmoji,
  removeEmoji
}) => {
  const [hideEmojiPicker, setHideEmojiPicker] = useState(true);

  const showHideEmojiPicker = () => {
    setHideEmojiPicker((prevState) => !prevState);
  };
  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="post bg-white p-1 my-1">
      <div>
        <Link to={`/profile/${user._id}`}>
          <img className="round-img" src={user.avatar || avatar} alt="" />
          <h4>{user.name || name}</h4>
        </Link>
      </div>
      <div>
        <p className="my-1">{text}</p>
        {link && link !== '' && !loading && (
          <ReactTinyLink
          cardSize="large"
          showGraphic={true}
          autoPlay={true}
          maxLine={2}
          minLine={1}
          url={link}
        />
        )}
        <p className="post-date">
          Posted on <Moment format="YYYY/MM/DD">{date}</Moment>
        </p>
        {showActions && (
          <Fragment>
            <button
              onClick={(e) => addLike(_id)}
              type="button"
              className="btn btn-light"
            >
              <i className="fas fa-thumbs-up"></i>{' '}
              {likes.length > 0 && <span>{likes.length}</span>}
            </button>
            <button
              onClick={(e) => removeLike(_id)}
              type="button"
              className="btn btn-light"
            >
              <i className="fas fa-thumbs-down"></i>
            </button>
            <Link to={`/posts/${_id}`} className="btn btn-primary">
              Discussion{' '}
              {comments.length > 0 && (
                <span className="comment-count">{comments.length}</span>
              )}
            </Link>
            {!auth.loading &&
              auth &&
              (user._id === auth.user._id || user === auth.user._id) && (
                <button
                  onClick={(e) => deletePost(_id)}
                  type="button"
                  className="btn btn-danger"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
          </Fragment>
        )}{' '}
        {hideEmojiPicker ? (
          <Button circular onClick={showHideEmojiPicker}>
            <span
              role="img"
              aria-label="smiling face"
              aria-labelledby="smiling face"
            >
              🙂
            </span>
          </Button>
        ) : (
          <EmojiPicker
            onBlur={showHideEmojiPicker}
            onPick={(emo, event) => {
              addEmoji(_id, emo);
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

                    if (isMine) removeEmoji(_id, emo._id);
                    else addEmoji(_id, emo.emoji);
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

PostItem.defaultProps = {
  showActions: true
};

PostItem.propTypes = {
  post: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  addLike: PropTypes.func.isRequired,
  removeLike: PropTypes.func.isRequired,
  deletePost: PropTypes.func.isRequired,
  addEmoji: PropTypes.func.isRequired,
  removeEmoji: PropTypes.func.isRequired
};
const mapStateToProps = (state) => ({
  auth: state.auth
});
export default connect(mapStateToProps, {
  addLike,
  removeLike,
  deletePost,
  addEmoji,
  removeEmoji
})(PostItem);
