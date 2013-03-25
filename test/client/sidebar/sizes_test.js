var expect = chai.expect;

suite('sidebar sizes', function () {
  test('all sizes', function () {
    expect(lg.sidebarSizes.width).to.equal(window.innerWidth * 0.15);

    expect(lg.sidebarSizes.bigRectHeight).to.equal(30);
    expect(lg.sidebarSizes.bigRectWidth).to.almost.equal(window.innerWidth * 0.15, 0.1);

    expect(lg.sidebarSizes.smallRectHeight).to.equal(19);
    expect(lg.sidebarSizes.smallRectWidth).to.almost.equal(window.innerWidth * 0.15 * 0.7, 0.1);

    expect(lg.sidebarSizes.bigRectX).to.equal(0);
    expect(lg.sidebarSizes.smallRectX).to.almost.equal(window.innerWidth * 0.15 * 0.3, 0.1);

    expect(lg.sidebarSizes.bigTextX).to.equal(10);
    expect(lg.sidebarSizes.smallTextX).to.almost.equal(window.innerWidth * 0.15 * 0.3 + 6, 0.1);
  });
});
