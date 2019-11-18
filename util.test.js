const util = require('./util');

describe(`util`, () => {
  describe(`fillWith`, () => {
    it(`should fill list with default value`, () => {
      expect(util.fillWith('', 5, [1, 2])).toEqual([1, 2, '', '', '']);
    });
  });
});
