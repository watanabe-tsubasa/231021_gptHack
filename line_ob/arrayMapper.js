const arrayMapper = (array) => {
  const mappedArray = array.map(elem => {
    return `${elem[0]}が${elem[1]}秒`
  })
  return mappedArray.join('\n')
};

console.log(arrayMapper([]))

module.exports = { arrayMapper };