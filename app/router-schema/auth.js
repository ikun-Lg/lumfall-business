module.exports = {
  "/api/auth/login": {
    post: {
      body: {
        type: "object",
        properties: {
          username: { type: "string", minLength: 1 },
          password: { type: "string", minLength: 1 },
        },
        required: ["username", "password"],
      },
    },
  },
  "/api/auth/current_user": {
    get: {},
  },
  "/api/auth/update_profile": {
    post: {
      body: {
        type: "object",
        properties: {
          nickname: { type: "string", minLength: 1, maxLength: 32 },
        },
        required: ["nickname"],
      },
    },
  },
  "/api/auth/change_password": {
    post: {
      body: {
        type: "object",
        properties: {
          oldPassword: { type: "string", minLength: 1 },
          newPassword: { type: "string", minLength: 6, maxLength: 32 },
        },
        required: ["oldPassword", "newPassword"],
      },
    },
  },
};
