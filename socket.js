module.exports = {
  init: (httpServer, options) => {
    io = require("socket.io")(httpServer, options);
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized");
    }
    return io;
  }
};
