import React, { useEffect, useRef } from 'react';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';

function useOutsideAlerter(ref, cb) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        cb();
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, cb]);
}

const EmojiPicker = ({ onPick, onBlur }) => {
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, onBlur);

  return (
    <span ref={wrapperRef}>
      <Picker onClick={onPick} />
    </span>
  );
};

export default EmojiPicker;
