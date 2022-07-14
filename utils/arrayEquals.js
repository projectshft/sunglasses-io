const arrayEquals = (arr1, arr2) => {
  if (!arr1 || !arr2) {
    return false
  }

  if (arr1.length != arr2.length) {
    return false;
  }

  let tester = true;

  arr1.map((post, i) => {
    if (post != arr2[i]) {
      tester = false;
    }
  })

  if (tester) {
    return true;
  } else {
    return false;
  }
}

module.exports = arrayEquals;