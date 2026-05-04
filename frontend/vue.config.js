module.exports = {
  // if the app is supposed to run on Github Pages in a subfolder, use the following config:
  // publicPath: process.env.NODE_ENV === "production" ? "/townsquare/" : "/"
  publicPath: process.env.NODE_ENV === "production" ? "/" : "/",
  devServer: {
    port: 8081,
    // 与 README、AGENTS 和稳定化手动 QA 计划保持一致。
  }
};
