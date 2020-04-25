# React-token-based-authentication-module-with-Axios-Interceptors-tutorial
A tutorial for token-based authentication react module with Axios.

The main idea is once the user enters the URL. our app should check the localStorage if this user has been logged in before. 

A- If localStorage has info about the user, our app would continue to see if the user's access_token is still active.
If access_tokenis active, the user is good to go and he is successfully authenticated.
If access_token expired, our app should send a refreshToken request and get a new access_token 

B- If localStorage doesn't have info about the user, out app should redirect the user to a login page where they'll be able to give a username and a password.

The function responsible for A is getUser(), The function doing B is login(username, pass).

To sum up, once the app starts, the app calls getUser() which either authenticates the user or not.
If not the app calls login with the user credentials and the login function calls getUser to get the currUser info.
