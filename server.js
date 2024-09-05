import express from "express";
import fetch from "node-fetch";
import url from 'url';

const app = express();
const port = 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.static('.'));

// Proxy middleware
// app.use("/proxy/json", async (req, res) => {
//   // Construct the URL to fetch from the target server
//   const url = "http://localhost:9222/json";

//   try {
//     // Fetch the response from the target URL
//     const response = await fetch(url, {
//       method: req.method,
//       headers: req.headers,
//     });

//     // Get the content type from the response headers
//     const contentType = response.headers.get("Content-Type");

//     // Set the content type header for the response
//     res.setHeader("Content-Type", contentType);

//     // Pipe the response data to the client
//     response.body.pipe(res);
//   } catch (error) {
//     // Handle any errors that occur during the fetch
//     console.error("Error fetching data:", error);
//     res.status(500).send("Error fetching data");
//   }
// });

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
