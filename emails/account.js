const config = require('config');

const sendGridApiKey = config.get('SEND_GRID_API_KEY');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(sendGridApiKey);

const template = (name, firstText, linkPath, secondText, linkText) => {
  return `
  <html lang="en">
    <head>
    <style>
    .container {
      width: 90%;
      margin: auto;
    }
    .jumbotron.jumbotron-fluid {
      background: #0e0a0aa6;
      color: white;
      padding: 1.5rem;
      text-align: center;
      font-family: monospace;
    }
    h4 {
      text-align: center;
      font-family: sans-serif;
    }
    .message-container {
      background: #f4f4f4;
      padding: 1rem;
    }
    p.lead {
      font-size: 16px;
      font-family: sans-serif;
    }
    a.btn {
      display: inline-block;
      text-decoration: none;
      padding: 0.4rem 1.3rem;
      font-size: 1rem;
      border: none;
      cursor: pointer;
      margin-right: 0.5rem;
      transition: opacity 0.2s ease-in;
      outline: none;
      background: #343a40;
      color: #fff;
      border-radius: 6px;
    }
    .dropdown-divider {
      width: 90%;
      background: #484e5361;
      height: 1px;
      margin: 17px auto;
      border-radius: 8px;
    }
  </style>
      <title>Dev Connector App</title>
    </head>
    
    <body>
      <div class="container">
        <div class="jumbotron jumbotron-fluid">
          <div class="container">
            <h1 class="display-4 text-center">Dev Connector</h1>
          </div>
        </div>
        <section style="height: 40vh;">
          <h4 class="text-center">Hello ${name}</h4>
          <div class="message-container">
            <p class="lead">
              ${firstText}
            </p>
            <a href="${linkPath}" class="btn btn-dark">${linkText}</a>
            <div class="dropdown-divider"></div>
            <p>
              ${secondText}
            </p>
          </div>
        </section>
      </div>
    </body>
  </html>
  `;
};

const accountVerifyEmail = async (name, email, link) => {
  const mailOptions = {
    to: email,
    from: 'aboal7anan@gmail.com',
    subject: 'Confirm your Account',
    html: template(
      name,
      `Congratulations! You're almost set to start using DevConnector
    Just click the link below to validate your email address.`,
      link,
      `Verifying your email ensures that you can access and manage your account, and receive critical notifications.
    Note: You must perform this validation within one hour to keep your new account enabled, otherwise you need to sign up once again`,
      `Confirm`
    ),
    text: `Hello ${name} \n 
      Congratulations! You're almost set to start using DevConnector.\n
      Just click the link below to validate your email address. \n\n
        ${link} \n\n
      Verifying your email ensures that you can access and manage your account, and receive critical notifications.\n\n
      Note: You must perform this validation within one hour to keep your new account enabled, otherwise you need to sign up once again\n`
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    console.log(error);
    throw error.message;
  }
};
const accountActivatedEmail = async (name, email) => {
  const mailOptions = {
    to: email,
    from: 'aboal7anan@gmail.com',
    subject: 'Confirmation',
    html: template(
      name,
      `Your account ${email} has been activated successfully.You may now log in and begin using it.`,
      `https://dev-connector-hyf.herokuapp.com`,
      ` `,
      `Go to App`
    ),
    text: `Thanks ${name} \n 
          Your account ${email} has been activated successfully.\n
          You may now log in and begin using it.\n`
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    console.log(error);
    throw error.message;
  }
};

const forgetPasswordEmail = async (name, email, link) => {
  const mailOptions = {
    to: email,
    from: 'bsilakaymak@gmail.com',
    name: 'DevConnector',
    subject: 'Password change request',
    html: template(
      name,
      `Please click on the following link to reset your password.`,
      link,
      ` If you did not request this, please ignore this email and your password will remain unchanged.`,
      `Click to Change Your Password`
    ),
    text: `Hello ${name} \n 
       Please click on the following link ${link} to reset your password. \n\n 
       If you did not request this, please ignore this email and your password will remain unchanged.\n`
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    throw error.message;
  }
};

const resetPasswordEmail = async (name, email) => {
  const mailOptions = {
    to: email,
    from: 'bsilakaymak@gmail.com',
    subject: 'Your password has been changed',
    html: template(
      name,
      `This is a confirmation that the password for your account ${email} has just been changed.`,
      `https://dev-connector-hyf.herokuapp.com/`,
      ` `,
      `Go to App`
    ),
    text: `Hello ${name} \n 
          This is a confirmation that the password for your account ${email} has just been changed.\n`
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    throw error.message;
  }
};

const friendAddedNotification = async (name, person, email) => {
  const mailOptions = {
    to: email,
    from: 'aboal7anan@gmail.com',
    subject: 'You have a new friend request',
    text: `Hello ${name} \n 
           ${person} wants to be your friend <a href="https://dev-connector-hyf.herokuapp.com/requests">click here to approve or decline</a>\n`,
    html: template(
      name,
      `${person} wants to be your friend <a href="https://dev-connector-hyf.herokuapp.com/requests">click here to approve or decline</a>`,
      `https://dev-connector-hyf.herokuapp.com`,
      `If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>`,
      `Go to App`
    )
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    throw error.message;
  }
};

const friendAcceptedNotification = async (name, person, email) => {
  const mailOptions = {
    to: email,
    from: 'aboal7anan@gmail.com',
    subject: 'Your friend request is accepted',
    html: template(
      name,
      `You are now friends with ${person}`,
      `https://dev-connector-hyf.herokuapp.com`,
      `If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>`,
      `Go to App`
    ),
    text: `Hello ${name} \n 
          You are now friends with ${person}\n`
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    throw error.message;
  }
};

const likeNotification = async (name, person, post, email) => {
  const mailOptions = {
    to: email,
    from: 'aboal7anan@gmail.com',
    subject: 'Someone liked your post',
    html: template(
      name,
      `${person} liked your post ${post}`,
      `https://dev-connector-hyf.herokuapp.com`,
      `If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>`,
      `Go to App`
    ),
    text: `   Hello ${name}, 
    ${person} liked your post ${post}
    If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>\n`
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    throw error.message;
  }
};

const emojiNotification = async (name, person, post, email) => {
  const mailOptions = {
    to: email,
    from: 'aboal7anan@gmail.com',
    subject: 'Someone add emoji to your post',
    html: template(
      name,
      `${person} add emoji to your post ${post}`,
      `https://dev-connector-hyf.herokuapp.com
https://dev-connector-hyf.herokuapp.com`,
      `If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com
https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>`,
      `Go to App`
    ),
    text: `   Hello ${name}, 
    ${person}  add emoji to your post ${post}
    If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>\n`
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    throw error.message;
  }
};

const addCommentNotification = async (name, person, post, email, comment) => {
  const mailOptions = {
    to: email,
    from: 'aboal7anan@gmail.com',
    subject: 'Someone add comment to your post',
    html: template(
      name,
      `${person} add <strong>${comment}</strong> comment to your post ${post}`,
      `https://dev-connector-hyf.herokuapp.com`,
      `If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>`,
      `Go to App`
    ),
    text: `   Hello ${name}, 
    ${person}  add comment to your post ${post}
    If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>\n`
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    throw error.message;
  }
};
const addCommentEmojiNotification = async (name, person, comment, email) => {
  const mailOptions = {
    to: email,
    from: 'aboal7anan@gmail.com',
    subject: 'Someone add emoji to your comment',
    html: template(
      name,
      `${person} add emoji to your comment ${comment}`,
      `https://dev-connector-hyf.herokuapp.com`,
      `If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>`,
      `Go to App`
    ),
    text: `   Hello ${name}, 
    ${person}  add emoji to your comment ${comment}
    If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>\n`
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    throw error.message;
  }
};

const JoinedGroupNotification = async (name, person, group, email) => {
  const mailOptions = {
    to: email,
    from: 'aboal7anan@gmail.com',
    subject: 'Someone joined in Group',
    html: template(
      name,
      `${person} joined in ${group} Group`,
      `https://dev-connector-hyf.herokuapp.com`,
      `If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>`,
      `Go to App`
    ),
    text: `   Hello ${name}, 
    ${person} joined in ${group} Group
    If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>\n`
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    throw error.message;
  }
};

const leftGroupNotification = async (name, person, group, email) => {
  const mailOptions = {
    to: email,
    from: 'aboal7anan@gmail.com',
    subject: 'Someone left the Group',
    html: template(
      name,
      `${person} left the ${group} Group`,
      `https://dev-connector-hyf.herokuapp.com`,
      `If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>`,
      `Go to App`
    ),
    text: ` Hello ${name}, 
    ${person}  left the ${group} Group
    If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>\n`
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    throw error.message;
  }
};

const deleteGroupNotification = async (name, owner, group, email) => {
  const mailOptions = {
    to: email,
    from: 'aboal7anan@gmail.com',
    subject: 'Deleted Group!',
    html: template(
      name,
      `${owner} deleted Group ${group}`,
      `https://dev-connector-hyf.herokuapp.com`,
      `If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>`,
      `Go to App`
    ),
    text: `   Hello ${name}, 
    ${owner}  deleted Group${group}
    If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com
https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>\n`
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    throw error.message;
  }
};

const addPostGroupNotification = async (name, personAddPost, group, email) => {
  const mailOptions = {
    to: email,
    from: 'aboal7anan@gmail.com',
    subject: `Someone add post on group ${group} `,
    html: template(
      name,
      `${personAddPost} add post on  ${group} group`,
      `https://dev-connector-hyf.herokuapp.com`,
      `If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>`,
      `Go to App`
    ),
    text: `   Hello ${name}, 
    ${personAddPost} add post on  ${group} group
    If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>\n`
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    throw error.message;
  }
};

const addEventGroupNotification = async (
  name,
  personAddEvent,
  group,
  email,
  startTime,
  endTime,
  eventTitle
) => {
  const mailOptions = {
    to: email,
    from: 'aboal7anan@gmail.com',
    subject: `Someone add Event in ${group} group`,
    html: template(
      name,
      `${personAddEvent} add an event ${eventTitle} in ${group} group. It will start from ${startTime} to ${endTime}`,
      `https://dev-connector-hyf.herokuapp.com
https://dev-connector-hyf.herokuapp.com`,
      `If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com
https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>`,
      `Go to App`
    ),
    text: ` Hello ${name}, 
    ${personAddEvent} add event ${eventTitle} on group ${group}
    If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com
https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>\n`
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    throw error.message;
  }
};

const addCommentGroupNotification = async (
  name,
  person,
  group,
  email,
  post,
  comment
) => {
  const mailOptions = {
    to: email,
    from: 'aboal7anan@gmail.com',
    subject: 'Someone add comment to your post',
    html: template(
      name,
      `${person} add <strong>${comment}</strong> comment to your post ${post} in ${group} group`,
      `https://dev-connector-hyf.herokuapp.com
https://dev-connector-hyf.herokuapp.com`,
      `If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com
https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>`,
      `Go to App`
    ),
    text: `   Hello ${name}, 
    ${person}  add comment to your post ${post} in ${group} group
    If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com
https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>\n`
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    throw error.message;
  }
};

const addEmojiPostGroupNotification = async (
  name,
  person,
  group,
  email,
  post
) => {
  const mailOptions = {
    to: email,
    from: 'aboal7anan@gmail.com',
    subject: 'Someone add emoji to your post',
    html: template(
      name,
      `${person} add emoji to your ${post} post in ${group} group`,
      `https://dev-connector-hyf.herokuapp.com
https://dev-connector-hyf.herokuapp.com`,
      `If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com
https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>`,
      `Go to App`
    ),
    text: `   Hello ${name}, 
    ${person}  add emoji to your ${post} post in ${group} group
    If you do not want to receive e-mail notifications, you can disable it on <a href="https://dev-connector-hyf.herokuapp.com
https://dev-connector-hyf.herokuapp.com/edit-userinfo">edit user info</a>\n`
  };
  try {
    await sgMail.send(mailOptions);
  } catch (error) {
    throw error.message;
  }
};

module.exports = {
  forgetPasswordEmail,
  resetPasswordEmail,
  friendAddedNotification,
  friendAcceptedNotification,
  likeNotification,
  emojiNotification,
  addCommentNotification,
  addCommentEmojiNotification,
  JoinedGroupNotification,
  leftGroupNotification,
  deleteGroupNotification,
  addPostGroupNotification,
  addEventGroupNotification,
  addCommentGroupNotification,
  addEmojiPostGroupNotification,
  accountVerifyEmail,
  accountActivatedEmail
};
