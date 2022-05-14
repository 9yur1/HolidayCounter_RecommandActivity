const today = new Date(); //오늘 날짜 입력
const holiday = new Date("2022-10-01"); //공휴일 날짜 입력

console.log(today.getMonth() + 1);

const diffDate = today.getTime() - holiday.getTime();

const dday = Math.abs(diffDate / (1000 * 3600 * 24));

console.log(dday);
