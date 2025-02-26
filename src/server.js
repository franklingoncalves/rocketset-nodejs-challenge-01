import http from "node:http";

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(JSON.stringify({ message: "Hello World" }));
  }
});

server.listen(3333, () => {
  console.log("🚀 Server is running");
});
