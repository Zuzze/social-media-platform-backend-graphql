# Social Media Platform Backend GraphQL

This repository includes basic GraphQL template for Social Media Platform. Posts are updated realtime using websockets.

## Features:

- Feed
- View post
- Edit post
- Add post
- Delete post
- Signup
- Login
- Logout

## Tools used

- `mongoDB` - NoSQL database
- `mongoose` - Library for MongoDB to make working with mongoDB easier
- `bcrypt` - password encryption for user passwords
- `multer` - upload files to posts
- `JWT (JSON Web Token)` - authenticate requests
- `express-graphql` - handle GraphQL requests
- `socket.io` - to trigger update on client via websockets when new posts have been added to backend
