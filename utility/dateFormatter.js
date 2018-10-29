//Date formatter for convenience.
module.exports = (dateString) =>{
	if(dateString == null){
		return dateString;
	}
    let year = dateString.substr(0, 4);
    let month = dateString.substr(5, 2);
    let day = dateString.substr(8, 2);
    return new Date(year, month - 1, day).getTime();
}