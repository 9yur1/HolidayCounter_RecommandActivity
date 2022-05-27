const express = require("express");
const app = express();
const request = require("request");
const convert = require("xml-js");
const fs = require("fs");
const xml2js = require("xml2js");
const static = require("serve-static");

// Modify the values as needed
var year = "2022";
var month = "09";
var operation = "getHoliDeInfo";

// Do not modify the values
var SERVEICE_KEY =
  "qBtJy2Prw8CCnAiijUM7VkuaA9MZozHuiQI4FbEGYdUDPz4%2FM%2FuxegGjNBWK0aWQHvSslVHwIZQwNWh57WgRTA%3D%3D";
var url = "http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/";
var queryParams = "?" + "solYear" + "=" + year;
queryParams += "&" + "solMonth" + "=" + month;
queryParams += "&" + "ServiceKey" + "=" + SERVEICE_KEY;
let requestUrl = url + operation + queryParams;

// Empty variables
var text = "";
var dateName = [];
var locdate = [];
var tempArr = [];

// To run EJS engine
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(static(__dirname));

// To get today date by using Date
function getTodayDate() {
  var today = new Date();
  var year = today.getFullYear();
  var month = ("0" + (today.getMonth() + 1)).slice(-2);
  var day = ("0" + today.getDate()).slice(-2);
  var dateString = year + "-" + month + "-" + day;
  // return "2022-10-04"; // 테스트용 날짜를 입력하세요. 테스트가 끝나면 주석처리 하세요. ex) 2022-09-12, 2022-09-15, 2022-10-04
  return dateString;
}

// To get modified date from locdate
function getModifiedDate(locdate) {
  return (
    locdate.substr(0, 4) +
    "-" +
    locdate.substr(4, 2) +
    "-" +
    locdate.substr(6, 2)
  );
}

// To get remaining days from locdate
function getLeftDate(dateName, locdate) {
  var today = new Date(getTodayDate()); // today date
  var holiday = new Date(getModifiedDate(locdate)); // holiday date
  var diffDate = today.getTime() - holiday.getTime();
  var dday = Math.abs(diffDate / (1000 * 3600 * 24));
  return dday;
}

// To change parameter
function changeParams(year, month, operation) {
  queryParams = "?" + "solYear" + "=" + year;
  queryParams += "&" + "solMonth" + "=" + month;
  queryParams += "&" + "ServiceKey" + "=" + SERVEICE_KEY;
  requestUrl = url + operation + queryParams;
}

// To check is this left holiday
function cmpDate(date) {
  var today = getTodayDate().replace(/\-/g, "");
  if (Number(today) <= Number(date)) {
    return true;
  }
}

// To get data from holiday api by using parmas
function getData() {
  request.get(requestUrl, (err, res, body) => {
    if (err) {
      console.log("err => " + err);
    } else {
      if (res.statusCode == 200) {
        // Read url success
        var result = body;
        var xmlToJson = convert.xml2json(result, { compact: true, spaces: 4 });
        fs.writeFileSync("holi.xml", result); // Create/Modify holi.xml
        fs.writeFileSync("holi.json", xmlToJson); // Create/Modify holi.json
        var parser = new xml2js.Parser();
        parser.parseString(result, function (err, res) {
          text = JSON.stringify(res);
          // Get dataName method
          dateName = [];
          var idx = text.indexOf("dateName", 0);
          while (idx != -1) {
            var start = text.indexOf("[", idx) + 2;
            var end = text.indexOf("]", idx) - 1;
            var tempStr = text.substring(start, end);
            dateName.push(tempStr);
            idx = text.indexOf("dateName", idx + 1);
          }
          console.log(dateName);
          // Get locdate method
          locdate = [];
          idx = text.indexOf("locdate", 0);
          while (idx != -1) {
            var start = text.indexOf("[", idx) + 2;
            var end = text.indexOf("]", idx) - 1;
            var tempStr = text.substring(start, end);
            locdate.push(tempStr);
            idx = text.indexOf("locdate", idx + 1);
          }
          console.log(locdate);
          var holiArr = [];
          for (var i = 0; i < dateName.length; i++) {
            holiArr.push(getLeftDate(dateName[i], locdate[i]));
          }
          console.log(holiArr);
          // Create tempArr to save dateName and locdate and leftDate at once
          tempArr = [];
          // To check left holiday
          var check = false;
          for (var i = 0; i < locdate.length; i++) {
            if (cmpDate(locdate[i])) {
              check = true;
              tempArr.push(dateName[i]); // Get recent holiday name
              tempArr.push(locdate[i]); // Get recent holiday date
              tempArr.push(holiArr[i]); // Get leftDate through locdate
              break;
            }
          }
          console.log(tempArr);
          if (!check) {
            // If there are no holidays left this month
            console.log(
              "이번 달에는 남은 공휴일이 없습니다. 다음달 데이터를 불러옵니다."
            );
            // Get next month data
            month = String(Number(month) + 1).padStart(2, "0");
            changeParams(year, month, operation);
            getData();
          }
          console.log("* api로부터 데이터를 불러왔습니다.");
          console.log("오늘의 날짜는", getTodayDate(), "입니다.");
          console.log(
            "가장 가까운 공휴일인 [" +
              tempArr[0] +
              "]의 날짜는 [" +
              tempArr[1] +
              "]이고, [" +
              tempArr[2] +
              "]일 남았습니다."
          );
        });
      }
    }
  });
}

// To initialize datas when calling webpage
function init() {
  // Intialize Year, Month
  var date = getTodayDate().split("-");
  year = date[0];
  month = date[1];
  operation = "getHoliDeInfo";
  changeParams(year, month, operation);
  // Get data from holiday api
  getData();
}

// Get request for web service
app.get("/", function (req, res) {
  init();
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

// Get request for app service(Send main data)
app.get("/app", function (req, res) {
  init();
  res.send(
    getTodayDate() + "," + tempArr[0] + "," + tempArr[1] + "," + tempArr[2]
  );
});

init();

const port = 8080;
app.listen(port, () => console.log("Listening on port " + port));
