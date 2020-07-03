import React, { useState, Fragment, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import useDebounce from './debounce-hook';

const SearchBar = () => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const [userInput, setUserInput] = useState({
    query: ''
  });
  const debouncedSearchTerm = useDebounce(userInput, 200);

  const [results, setResults] = useState([]);
  const [searchSubject, setSearchSubject] = useState('');
  const onChangeHandler = (e) => {
    e.preventDefault();
    setUserInput({
      query: e.target.value
    });
  };

  const apiCall = async (searchSubject) => {
    try {
      const res = await axios.post(
        `api/search/${searchSubject}`,
        debouncedSearchTerm,
        config
      );
      setResults(res.data);
    } catch (error) {}
  };

  useEffect(() => {
    apiCall(searchSubject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInput, searchSubject]);
  return (
    <div>
      <div className="searchbar flex-center">
        <div className="select">
          <select
            className="ui dropdown"
            name="searchSubject"
            value={searchSubject}
            onChange={(e) => {
              e.preventDefault();
                setSearchSubject(e.target.value);
              setResults([]);
              setUserInput({
                query: ''
              });
            }}
          >
            <option className="search-option" value="0">
              Please select what to search
            </option>
            <option className="search-option" value="profile">
              Users
            </option>
            <option className="search-option" value="posts">
              Posts
            </option>
            <option className="search-option" value="groups">
              Groups
            </option>
          </select>
        </div>

        <div className="ui input" style={{ height: '3rem', margin: '1rem' }}>
          <input
            type="text"
            value={userInput.query}
            name="name"
            placeholder="Search..."
            onChange={(e) => {
              onChangeHandler(e);
            }}
          ></input>
        </div>
      </div>
      <div className="search-results-container">
        {searchSubject !== '' &&
          userInput.query !== '' &&
          (!results || results.length === 0) && (
            <h3
              className="text-dark large"
              style={{
                width: '100%',
                textAlign: 'center',
                marginTop: '1.5rem',
                color: '#dc3545'
              }}
            >
              No results
            </h3>
          )}
        {(searchSubject === '' || userInput.query === '') && (
          <h3
            className="text large"
            style={{
              width: '100%',
              textAlign: 'center',
              marginTop: '1.5rem'
            }}
          >
            Search users, posts or groups...
          </h3>
        )}
        {results &&
          searchSubject !== '' &&
          userInput.query !== '' &&
          results.map((result) => (
            <div key={result.id} className="text-center search-results">
              {searchSubject === 'profile' && (
                <div>
                  <img
                    src={result.avatar}
                    alt="user-avatar"
                    style={{ width: '85%', borderRadius: '50%' }}
                  />
                </div>
              )}
              <Link
                to={`/${searchSubject}/${result.id}`}
                className="text-dark search-result-label"
              >
                {result.label}
              </Link>
              {searchSubject === 'profile' && (
                <div>
                  <p>{result.status}</p>
                </div>
              )}
              {searchSubject === 'groups' && (
                <Fragment>
                  <div className="group-access">
                    {result.isPublic ? `Public` : `Private`}
                  </div>
                  <span>{result.description}</span>
                </Fragment>
              )}
              {searchSubject === 'posts' && (
                <Fragment>
                  <span className="text-dark">
                    <strong>by :</strong> {result.name}
                  </span>
                  <Moment format="YYYY/MM/DD">{result.date}</Moment>
                </Fragment>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default SearchBar;
