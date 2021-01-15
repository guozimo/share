function addZero(num) {
  return num < 10 ? "0" + num : num;
}
function formatDate(timestamp) {
  timestamp = Number(timestamp);
  var date = new Date(timestamp);
  var year = date.getFullYear();
  var month = addZero(date.getMonth() + 1);
  var day = addZero(date.getDate());
  var hours = addZero(date.getHours());
  var minutes = addZero(date.getMinutes());
  return year + "-" + month + "" + day + "-" + "" + hours + "" + minutes;
}
module.exports = formatDate;
