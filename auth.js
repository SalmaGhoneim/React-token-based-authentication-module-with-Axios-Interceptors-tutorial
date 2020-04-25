const getUser = () => {
  let currUser = JSON.parse(localStorage.getItem("my_app_user"));

  if (!currUser) {
    // if no user in localStorage then the user must enter their credentials to proceed
    return Promise.resolve(null);
  }

  // get the expiry time of the current access token and measure whether it expired or not
  let currDate = new Date();
  let duration = currUser["expires_in"] * 1000;
  let diff = currDate.getTime() - currUser.lastRefresh;

  if (diff >= duration) {
    // access token expired need to refresh token
    let getUserFormData = new FormData();
    getUserFormData.append("grant_type", "refresh_token");
    getUserFormData.append("refresh_token", currUser.refresh_token);

    return axios
      .post(`${URL}/token/url`, getUserFormData, {
        headers: {
          Authorization: "Basic {secret_key}"
        }
      })
      .then(response => {
        currUser.refresh_token = response.data.refresh_token;
        currUser.access_token = response.data.access_token;
        currUser.lastRefresh = new Date().getTime();

        localStorage.setItem("my_app_user", JSON.stringify(currUser));
        my_app.defaults.headers.common["Authorization"] =
          "Bearer " + currUser.access_token;
        return my_app.get("/users/current/url").catch(error => {
          logout();
          throw error;
        });
      })
      .catch(error => {
        logout();
      });
  } else {
    // Do not need refresh
    my_app.defaults.headers.common["Authorization"] =
      "Bearer " + currUser.access_token;
    my_app.interceptors.response.use(
      response => {
        return response;
      },
      error => {
        if (error.response.status === 401) {
          // 401 is Unauthorized error
          // which means that this request failed
          // what we need to do is send a refresh request then resend the same request
          // that failed but with the new access point.
          // We can do this automatically using axios interceptors
          return refreshToken()
            .then(response => {
              currUser.refresh_token = response.data.refresh_token;
              currUser.access_token = response.data.access_token;
              currUser.lastRefresh = new Date().getTime();
              localStorage.setItem("my_app_user", JSON.stringify(currUser));

              // Set default headers to have authorization the access token as authorization for future requests
              my_app.defaults.headers.common["Authorization"] =
                "Bearer " + response.data.access_token;

              // Get the original that failed due to 401 and resend it
              // with the new access token
              const config = error.config;
              config.headers.Authorization =
                "Bearer " + response.data.access_token;

              // Resending original request
              return new Promise((resolve, reject) => {
                my_app
                  .request(config)
                  .then(response => {
                    resolve(response);
                  })
                  .catch(error => {
                    reject(error);
                  });
              });
            })
            .catch(error => {
              // if refresh token failed logout
              Promise.reject(error);
              logout();
            });
        }
        logout();
        return new Promise((resolve, reject) => {
          reject(error);
        });
      }
    );
    return my_app.get("/users/current/url").catch(error => {
      logout();
      throw error;
    });
  }
};

const login = (username, password) => {
  let loginFormData = new FormData();
  loginFormData.append("grant_type", "password");
  loginFormData.append("username", username);
  loginFormData.append("password", password);

  return new Promise((resolve, reject) => {
    axios
      .post(`${URL}/token/url`, loginFormData, {
        headers: {
          Authorization: "Basic {secret_key}"
        }
      })
      .then(async response => {
        response.data.lastRefresh = new Date().getTime();
        localStorage.setItem("my_app_user", JSON.stringify(response.data));
        getUser()
          .then(response => {
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
      })
      .catch(error => {
        reject(error);
      });
  });
};

const refreshToken = () => {
  let currUser = JSON.parse(localStorage.getItem("my_app_user"));
  let getUserFormData = new FormData();
  getUserFormData.append("grant_type", "refresh_token");
  getUserFormData.append("refresh_token", currUser.refresh_token);
  return new Promise((resolve, reject) => {
    my_app
      .post(`${URL}/token/url/`, getUserFormData, {
        headers: {
          Authorization: "Basic {secret_key}"
        }
      })
      .then(async response => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};
