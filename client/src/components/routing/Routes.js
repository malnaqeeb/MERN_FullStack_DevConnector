import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Login from '../auth/Login';
import Register from '../auth/Register';
import Alert from '../layout/Alert';

import Dashboard from '../dashboard/Dashboard';
import CreateProfile from '../profile-forms/CreateProfile';
import EditProfile from '../profile-forms/EditProfile';
import EditUserInfo from '../profile-forms/EditUserInfo';
import AddExperience from '../profile-forms/AddExperience';
import AddEducation from '../profile-forms/AddEducation';
import Profiles from '../profiles/Profiles';
import Profile from '../profile/Profile';
import Posts from '../posts/Posts';
import Post from '../post/Post';
import ForgotPassword from '../auth/ForgotPassword';
import ResetPassword from '../auth/ResetPassword';
import Message from '../message/Message';
import NotFound from '../layout/NotFound';
import PraivateRoute from '../routing/PraivateRoute';

import FriendsList from '../friends/FriendsList';
import FriendsRequestslist from '../friends/FriendRequestsList';
// test comment

import GroupPosts from '../groups/GroupPosts';
import GroupDetails from '../groups/GroupDetails';
import GroupsForm from '../groups/GroupsForm';
import Groups from '../groups/Groups';
import SearchBar from '../layout/SearchBar';
import ConfirmationEmail from '../confirmationEmail/ConfirmationEmail';
import ConfirmationMessage from '../confirmationEmail/ConfirmationMessage';

import Settings from '../dashboard/Settings';

const Routes = () => {
  return (
    <section className="container">
      <Alert />
      <Switch>
        <Route exact path="/register" component={Register} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/forgotpassword" component={ForgotPassword} />
        <Route exact path="/resetpassword" component={ResetPassword} />
        <Route exact path="/profiles" component={Profiles} />
        <Route exact path="/profile/:id" component={Profile} />
        <Route exact path="/confirm/:token" component={ConfirmationEmail} />
        <Route
          exact
          path="/confirmation/message"
          component={ConfirmationMessage}
        />
        <PraivateRoute exact path="/groups" component={Groups} />
        <PraivateRoute exact path="/groups/details" component={GroupDetails} />
        <PraivateRoute exact path="/groups/posts" component={GroupPosts} />
        <PraivateRoute exact path="/search" component={SearchBar} />
        <PraivateRoute exact path="/settings" component={Settings} />

        <PraivateRoute exact path="/creategroup" component={GroupsForm} />
        <PraivateRoute exact path="/groups/:groupID" component={GroupDetails} />
        <PraivateRoute
          exact
          path="/groups/:groupID/posts/:postID"
          component={GroupPosts}
        />
        <PraivateRoute exact path="/message/:id" component={Message} />
        <PraivateRoute exact path="/dashboard" component={Dashboard} />
        <PraivateRoute exact path="/create-profile" component={CreateProfile} />
        <PraivateRoute exact path="/edit-userinfo" component={EditUserInfo} />
        <PraivateRoute exact path="/edit-profile" component={EditProfile} />
        <PraivateRoute exact path="/add-experience" component={AddExperience} />
        <PraivateRoute exact path="/add-education" component={AddEducation} />
        <PraivateRoute exact path="/posts" component={Posts} />
        <PraivateRoute exact path="/posts/:id" component={Post} />
        <PraivateRoute exact path="/friends" component={FriendsList} />
        <PraivateRoute exact path="/requests" component={FriendsRequestslist} />
        <Route component={NotFound} />
      </Switch>
    </section>
  );
};

export default Routes;
