const queryHandler = (database, req) => {
  //'database' should be the exact name of the database.

  const paramNameArray = Object.keys(req.params)
  const paramName = paramNameArray[0];


  const reqName = req.params[paramName];

  let matching = [];
  let matchedList = [];

  database.map(item => {
    if (item.name == reqName) {
      matchedList.push(reqName)
    }
  })

  database.map(item => {
    if (item.name == reqName) {
      matching.push(item)
    }
  })

  if (matchedList.length > 0) {
    return matching;
  } else {
    return false;
  }
}

module.exports =  queryHandler;