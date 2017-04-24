(function () {

var root = this;

var noop = function () {};
var debug = false;
var log = debug ? console.log.bind(console) : noop;

function groupBy (data, iterator) {
  var results = [];
  var itr = typeof iterator === 'string' ?
    function (d) { return d[iterator]; } :
    iterator;

  data.forEach(function (d) {
    var key = itr(d);
    results[key] = results[key] || [];
    results[key].push(d);
  });

  return results;
}

function grid () {
  var config = {};
  config.width = 500;
  config.height = 1000;
  config.colWidth = 50;
  config.rowHeight = 50;
  config.sectionPadding = 100;
  config.marginLeft = config.colWidth;
  config.marginTop = config.sectionPadding;
  var data = [];
  var groupByFn = noop;
  var groupComparator;
  var dataComparator;
  var groups = [];

  log('config', config);

  function chart (selection) {}

  chart.data = function (x) {
    if (!arguments.length) return data;
    log('set data to', x);
    data = x;
    return chart;
  };

  chart.groupBy = function (x) {
    log('group by', x);
    groupByFn = x;

    chart.relayout();

    return chart;
  };

  chart.sort = function (x, y) {
    log('sort by', x);
    if (x) groupComparator = x;
    if (y) dataComparator = y;

    chart.relayout();

    return chart;
  };

  chart.groups = function () {
    return groups;
  };

  ['width', 'height', 'colWidth', 'rowHeight', 'sectionPadding', 'marginLeft', 'marginTop'].forEach(function (prop) {
    chart[prop] = function (x) {
      if (!arguments.length) return config[prop];
      log('set', prop, 'to', x);
      config[prop] = x;
      return chart;
    };
  });

  chart.relayout = function () {
    log('relayout');
    groups = [];
    var grouped = groupBy(data, groupByFn);
    var y0 = config.marginTop;

    Object.keys(grouped)
    .sort(groupComparator)
    .forEach(function (key, groupIdx) {
      var ds = grouped[key];
      var x0 = config.marginLeft;

      groups.push({ name: key, y: y0, groupIndex: groupIdx, data: ds });

      ds.sort(dataComparator)
      .forEach(function (d) {
        if (x0 + config.colWidth > config.width) {
          x0 = config.marginLeft;
          y0 += config.rowHeight;
        }

        d.x = x0;
        d.y = y0;
        d.groupIndex = groupIdx;

        x0 += config.colWidth;
      });

      y0 += config.sectionPadding;
    });

    config.height = y0;
    log('new height', y0);

    return chart;
  };

  return chart;
}

// TODO better export
if (typeof root.define === "function" && root.define.amd) {
  define(["d3"], function(d3) {
    d3.layout.grid = grid;
  });
} else {
  root.d3.layout.grid = grid;
}

}).call(this);
