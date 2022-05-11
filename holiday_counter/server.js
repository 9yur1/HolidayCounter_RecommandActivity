const express = require("express");
const app = express();
const request = require("request");
const convert = require("xml-js");
const fs = require("fs");
const xml2js = require("xml2js");

// Modify the values as needed
var year = "2022"; // 년도 입력
var month = "05"; // 월 입력
var operation = "getHoliDeInfo";

// Do not modify the values
var SERVEICE_KEY =
  "qBtJy2Prw8CCnAiijUM7VkuaA9MZozHuiQI4FbEGYdUDPz4%2FM%2FuxegGjNBWK0aWQHvSslVHwIZQwNWh57WgRTA%3D%3D";
var url =
  "http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/" +
  operation;
var queryParams = "?" + "solYear" + "=" + year;
queryParams += "&" + "solMonth" + "=" + month;
queryParams += "&" + "ServiceKey" + "=" + SERVEICE_KEY;
let requestUrl = url + queryParams;

// Empty variables
var text = "";
var dateName = [];
var locdate = [];
var tempArr = [];

// To run EJS engine
app.set("views", __dirname + "/views");
app.set("view engine", "");

app.get("/", function (req, res) {
  request.get(requestUrl, (err, res, body) => {
    if (err) {
      console.log("err => " + err);
    } else {
      if (res.statusCode == 200) {
        // Read url success
        var result = body;
        var xmlToJson = convert.xml2json(result, { compact: true, spaces: 4 });
        console.log(result);
        console.log(xmlToJson);
        fs.writeFileSync("holi.xml", result); // Create/Modify holi.xml
        fs.writeFileSync("holi.json", xmlToJson); // Create/Modify holi.json
        var parser = new xml2js.Parser();
        parser.parseString(result, function (err, res) {
          console.log(res);
          text = JSON.stringify(res);
          console.log(text);
          // Get dataName method
          dateName = [];
          var idx = text.indexOf("dateName", 0);
          while (idx != -1) {
            console.log(idx);
            var start = text.indexOf("[", idx) + 2;
            var end = text.indexOf("]", idx) - 1;
            var tempStr = text.substring(start, end);
            console.log(tempStr);
            dateName.push(tempStr);
            idx = text.indexOf("dateName", idx + 1);
          }
          console.log(dateName);
          // Get locdate method
          locdate = [];
          idx = text.indexOf("locdate", 0);
          while (idx != -1) {
            console.log(idx);
            var start = text.indexOf("[", idx) + 2;
            var end = text.indexOf("]", idx) - 1;
            var tempStr = text.substring(start, end);
            console.log(tempStr);
            locdate.push(tempStr);
            idx = text.indexOf("locdate", idx + 1);
          }
          console.log(locdate);
          // Create tempArr to save dateName and locdate at once
          tempArr = [];
          tempArr.push(dateName);
          tempArr.push(locdate);
          console.log(tempArr);
        });
      }
    }
  });
  // Send data from nodejs to ejs
  res.render("data.ejs", { data: tempArr }, function (err, html) {
    if (err) {
      console.log(err);
    }
    res.end(html); // End response
  });
  // send data.ejs
  res.sendFile(__dirname + "/views/data.ejs");
});

const port = 8080;
app.listen(port, () => console.log("Listening on port " + port));
