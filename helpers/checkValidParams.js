module.exports = (recievedParams, expectedParams) => {
  const recievedParamKeys = Object.keys(recievedParams);

  return recievedParamKeys.every((param) => expectedParams.includes(param));
};
