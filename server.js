const express = require("express");
const app = express();
const request = require("request");
const convert = require("xml-js");
const fs = require("fs");
const xml2js = require("xml2js");

// http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?solYear=2019&solMonth=03&ServiceKey=서비스키

var SERVEICE_KEY =
  "qBtJy2Prw8CCnAiijUM7VkuaA9MZozHuiQI4FbEGYdUDPz4%2FM%2FuxegGjNBWK0aWQHvSslVHwIZQwNWh57WgRTA%3D%3D";
var operation = "getHoliDeInfo";
var url =
  "http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/" +
  operation;
var queryParams = "?" + "solYear" + "=" + "2022";
queryParams += "&" + "solMonth" + "=" + "05";
queryParams += "&" + "ServiceKey" + "=" + SERVEICE_KEY;
let requestUrl = url + queryParams;
var text = "";

app.get("/", function (req, res) {
  request.get(requestUrl, (err, res, body) => {
    if (err) {
      console.log("err => " + err);
    } else {
      if (res.statusCode == 200) {
        var result = body;
        var xmlToJson = convert.xml2json(result, { compact: true, spaces: 4 });
        console.log(result);
        console.log(xmlToJson);
        fs.writeFileSync("holi.json", xmlToJson);
        fs.writeFileSync("holi.xml", result);
        var parser = new xml2js.Parser();
        parser.parseString(result, function (err, res) {
          console.log(res);
          text = JSON.stringify(res);
          console.log(text);
        });
      }
    }
  });
  res.send(text);
});

const port = 8080;
app.listen(port, () => console.log("Listening on port " + port));
