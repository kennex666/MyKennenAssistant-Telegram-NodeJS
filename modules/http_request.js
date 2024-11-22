const https = require("https");

const requestHttpsGET = (url) => {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        rejectUnauthorized: false, // Bypass SSL certificate verification
      },
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      }
    );

    req.on("error", (error) => {
      reject(error);
    });
    req.end();
  });
};

const requestHttpsPOST = (url, details) => {
  let postData = JSON.stringify(details);

  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      rejectUnauthorized: false, // Bypass SSL certificate verification
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve(data);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

module.exports = { requestHttpsGET, requestHttpsPOST };
