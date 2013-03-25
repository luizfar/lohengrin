var expect = chai.expect;

suite('sidebar build', function () {
  function dummyBuild(extras, index, bigBuildsCount) {
    return lg.sidebarBuild(
      _({
        color: 'magenta',
        name: 'dummy',
        lastBuild: { number: 0 }
      }).extend(extras).value(),
      index,
      bigBuildsCount
    );
  }

  test('display name', function () {
    expect(
      dummyBuild({ name: 'name', lastBuild: { number: 10 } }).displayName
    ).to.equal('name#10');
  });

  test('code', function () {
    expect(
      dummyBuild({ name: 'name', lastBuild: { number: 10 }, color: 'red' }).code
    ).to.equal('name#10failure');
  });

  test('id', function () {
    expect(
      dummyBuild({ name: 'name', lastBuild: { number: 10 }, color: 'red' }).id
    ).to.equal('name#10failurefailure');
  });

  test('index', function () {
    expect(dummyBuild({}, 42).index).to.equal(42);
  });

  suite('status', function () {
    test('failure', function () { expect(dummyBuild({ color: 'red' }).status).to.equal('failure'); });
    test('success', function () { expect(dummyBuild({ color: 'blue' }).status).to.equal('success'); });
    test('building', function () { expect(dummyBuild({ color: 'banana anime' }).status).to.equal('building'); });
    test('aborted', function () { expect(dummyBuild({ color: 'banana' }).status).to.equal('aborted'); });
  });

  suite('color', function () {
    test('red', function () { expect(dummyBuild({ color: 'red' }).color).to.equal('red'); });
    test('green', function () { expect(dummyBuild({ color: 'blue' }).color).to.equal('green'); });
    test('yellow', function () { expect(dummyBuild({ color: 'banana anime' }).color).to.equal('yellow'); });
    test('gray', function () { expect(dummyBuild({ color: 'banana' }).color).to.equal('gray'); });
  });

  suite('height', function () {
    test('building', function () {
      expect(dummyBuild({ color: 'banana anime' }).height).to.equal(
        lg.sidebarSizes.bigRectHeight
      );
    });
    test('failed', function () {
      expect(dummyBuild({ color: 'red' }).height).to.equal(
        lg.sidebarSizes.bigRectHeight
      );
    });
    test('banana', function () {
      expect(dummyBuild({ color: 'banana' }).height).to.equal(
        lg.sidebarSizes.smallRectHeight
      );
    });
  });

  suite('width', function () {
    test('building', function () {
      expect(dummyBuild({ color: 'banana anime' }).width).to.equal(
        lg.sidebarSizes.bigRectWidth
      );
    });
    test('failed', function () {
      expect(dummyBuild({ color: 'red' }).width).to.equal(
        lg.sidebarSizes.bigRectWidth
      );
    });
    test('banana', function () {
      expect(dummyBuild({ color: 'banana' }).width).to.equal(
        lg.sidebarSizes.smallRectWidth
      );
    });
  });

  suite('font size', function () {
    test('building', function () {
      expect(dummyBuild({ color: 'banana anime' }).fontSize).to.equal('14px');
    });
    test('failed', function () {
      expect(dummyBuild({ color: 'red' }).fontSize).to.equal('14px');
    });
    test('banana', function () {
      expect(dummyBuild({ color: 'banana' }).fontSize).to.equal('10px');
    });
  });

  suite('text color', function () {
    test('building', function () {
      expect(dummyBuild({ color: 'banana anime' }).textColor).to.equal('black');
    });
    test('passing', function () {
      expect(dummyBuild({ color: 'blue' }).textColor).to.equal('white');
    });
    test('failed', function () {
      expect(dummyBuild({ color: 'red' }).textColor).to.equal('white');
    });
    test('banana', function () {
      expect(dummyBuild({ color: 'banana' }).textColor).to.equal('black');
    });
  });

  suite('rect x position', function () {
    test('building', function () {
      expect(dummyBuild({ color: 'banana anime' }).xPosition('rect')).to.equal(
        lg.sidebarSizes.bigRectX
      );
    });
    test('failed', function () {
      expect(dummyBuild({ color: 'red' }).xPosition('rect')).to.equal(
        lg.sidebarSizes.bigRectX
      );
    });
    test('banana', function () {
      expect(dummyBuild({ color: 'banana' }).xPosition('rect')).to.equal(
        lg.sidebarSizes.smallRectX
      );
    });
  });

  suite('text x position', function () {
    test('building', function () {
      expect(dummyBuild({ color: 'banana anime' }).xPosition('text')).to.equal(
        lg.sidebarSizes.bigTextX
      );
    });
    test('failed', function () {
      expect(dummyBuild({ color: 'red' }).xPosition('text')).to.equal(
        lg.sidebarSizes.bigTextX
      );
    });
    test('banana', function () {
      expect(dummyBuild({ color: 'banana' }).xPosition('text')).to.equal(
        lg.sidebarSizes.smallTextX
      );
    });
  });

  suite('rect y', function () {
    test('index < big builds count', function () {
      expect(dummyBuild({}, 2, 3).rectY).to.equal(
        2 * lg.sidebarSizes.bigRectHeight
      );
    });

    test('index > big builds count', function () {
      expect(dummyBuild({}, 5, 2).rectY).to.equal(
        (2 * lg.sidebarSizes.bigRectHeight) + (3 * lg.sidebarSizes.smallRectHeight)
      );
    });

    test('index == big builds count', function () {
      expect(dummyBuild({}, 4, 4).rectY).to.equal(
        4 * lg.sidebarSizes.bigRectHeight
      );
    });
  });

  suite('text y', function () {
    test('index < big builds count', function () {
      expect(dummyBuild({}, 2, 3).textY).to.equal(
        2 * lg.sidebarSizes.bigRectHeight + 20
      );
    });

    test('index > big builds count', function () {
      expect(dummyBuild({}, 5, 2).textY).to.equal(
        (2 * lg.sidebarSizes.bigRectHeight) + (3 * lg.sidebarSizes.smallRectHeight) + 13
      );
    });

    test('index == big builds count', function () {
      expect(dummyBuild({}, 4, 4).textY).to.equal(
        4 * lg.sidebarSizes.bigRectHeight + 13
      );
    });
  });

  suite('y position', function () {
    test('rect', function () {
      expect(
        _(dummyBuild()).tap(function (b) { b.rectY = 'banana'; }).value().yPosition('rect')
      ).to.equal('banana');
    });
    test('text', function () {
      expect(
        _(dummyBuild()).tap(function (b) { b.textY = 'banana'; }).value().yPosition('text')
      ).to.equal('banana');
    });
  });
});
