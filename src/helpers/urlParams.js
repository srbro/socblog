export const getQueryParams = () => {
  var queryString = {}
  var query = window.location.search.substring(1)
  var vars = query.split('&')
  var defaultQueryString = {clientId: '5a3e24b8-70cd-4958-b716-af9ce053e594', clientSecret: 'aazy6orsi9elhhs17e47lfb4palgszw6igf4y26z', productId: 'eon'}
  if (query.length === 0) {
    return defaultQueryString
  }
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=')
    // If first entry with this name
    if (typeof queryString[pair[0]] === 'undefined') {
      queryString[pair[0]] = decodeURIComponent(pair[1])
      // If second entry with this name
    } else if (typeof queryString[pair[0]] === 'string') {
      var arr = [ queryString[pair[0]], decodeURIComponent(pair[1]) ]
      queryString[pair[0]] = arr
      // If third or later entry with this name
    } else {
      queryString[pair[0]].push(decodeURIComponent(pair[1]))
    }
  }

  return queryString
}
