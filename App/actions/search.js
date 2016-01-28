var search = exports = module.exports

// Actions dispatched from search page
exports.latlngadd = function latlngadd(lat, lng) {
  return {
    type: 'LATLNG',
    latlong: ''+lat+','+ lng
  }
}

exports.timechange = function timechange(date) {
  return {
    type: 'TIME_CHANGE',
    date: date
  }
}

exports.loadingscreen = function loadingscreen(bool) {
  return {
    type: 'LOADING_SCREEN',
    loading: bool
  }
}

//

exports.eventView = function eventView(data) {
  console.log('event view action', data)
  return {
    type: "PASS_SEARCH_QUERY",
    prevData: data
  }
}

// ADDED GET DATA
exports.getData = function getData(data){
  return{
    type: "GET_DATA",
    apiresults: data
  }
}
