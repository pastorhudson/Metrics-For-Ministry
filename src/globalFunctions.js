String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};


function convertDate(dateString) {
  let date = new Date(dateString);
  //YYYYMMDD
  //console.log(birthday)
  let month = date.getMonth() + 1  // 10 (PS: +1 since Month is 0-based)
  let day = date.getDate()       // 30
  let year = date.getFullYear()

  return `${year}${month}${day}`

}

function convertDateLong(dateString) {
  let string = dateString.replaceAll('T', "").replaceAll("-", "").replaceAll(":", "").replaceAll("Z", "")

  return string;

}
  // YYYYMMDDHHMMSS'
