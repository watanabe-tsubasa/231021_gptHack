const compressArray = (arr) => {
  if (arr.length === 0) return [];

  const result = [];
  let prevElement = arr[0];
  let count = 1;

  for (let i = 1; i < arr.length; i++) {
      if (arr[i] === prevElement) {
          count++;
      } else {
          result.push([prevElement, count]);
          prevElement = arr[i];
          count = 1;
      }
  }
  // 最後の要素を結果に追加
  result.push([prevElement, count]);

  return result;
}

module.exports = { compressArray };