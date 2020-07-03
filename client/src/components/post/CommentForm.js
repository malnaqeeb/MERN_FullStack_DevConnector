import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import { addComment } from '../../actions/post';
import EmojiPicker from './EmojiPicker';

const CommentForm = ({ postId, addComment }) => {
  const [text, setText] = useState('');
  const [hideEmojiPicker, setHideEmojiPicker] = useState(true);

  const showHideEmojiPicker = () => {
    setHideEmojiPicker((prevState) => !prevState);
  };

  const insertEmoji = (emojiObj) => {
    const emoji = emojiObj.native;
    setText((prevText) => prevText + emoji);
  };

  return (
    <div className='post-form'>
      <div className='bg-primary p'>
        <h3>Leave a Comment</h3>
      </div>
      <form
        className='form my-1'
        onSubmit={(e) => {
          e.preventDefault();
          addComment(postId, { text });
          setText('');
        }}
      >
        <textarea
          name='text'
          cols='30'
          rows='5'
          placeholder='Create a post'
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        ></textarea>
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
            onPick={(emojiObj) => {
              showHideEmojiPicker();
              insertEmoji(emojiObj);
            }}
          />
        )}
        <input type='submit' className='btn btn-dark my-1' value='Submit' />
      </form>
    </div>
  );
};

CommentForm.propTypes = {
  addComment: PropTypes.func.isRequired,
};

export default connect(null, { addComment })(CommentForm);
