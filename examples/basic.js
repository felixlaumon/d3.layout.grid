function random (start, end) {
  var range = end - start;
  return start + Math.floor(Math.random() * range);
}

function randomPick (array) {
  var length = array.length;
  var index = random(0, array.length);
  return array[index];
}

function ascending (a, b) {
  return typeof a === 'string' ? 
    a.localeCompare(b) :
    a.size - b.size;
}
function descending (a, b) {
  return typeof a === 'string' ? 
    b.localeCompare(a) :
    b.size - a.size;
}

function randomComparator (d) {
  return randomPick([-1, 0, 1]);
}

function capitalize (str) {
  return str[0].toUpperCase() + str.substr(1);
}

var width = 500;
var height = 1000;
var color = d3.scale.category10();
var sizeScale = d3.scale.quantile().domain([20, 40]).range(d3.range(20, 40, 4));
var delayScale = d3.scale.linear().domain([0, 400]).range([0, 300]);

var data = d3.range(0, 150).map(function (i) {
  return {
    index: i,
    prop1: randomPick(['a', 'b', 'c']),
    prop2: randomPick(['a', 'b', 'c', 'd', 'e']),
    x: random(width / 2 - 100, width / 2 + 100),
    y: random(height / 2 - 100, height / 2 + 100),
    color: color(i),
    shape: randomPick(['circle', 'square', 'ellipse']),
    size: random(20, 40)
  };
});

var svg = d3.select('svg')
  .attr('width', width)
  .attr('height', height);

var shapes = svg.selectAll('.shape').data(data)
  .enter()
    .append('g')
      .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; })
      .attr('data-size', function (d) { return d.size; })
      .attr('data-shape', function (d) { return d.shape; });

var circles = shapes.filter(function (d) { return d.shape === 'circle'; })
  .append('circle')
    .attr('r', function (d) { return d.size / 2; })
    .attr('fill', function (d) { return d.color; });

var squares = shapes.filter(function (d) { return d.shape === 'square'; })
  .append('rect')
    .attr('width', function (d) { return d.size; })
    .attr('height', function (d) { return d.size; })
    .attr('x', function (d) { return - d.size / 2; })
    .attr('y', function (d) { return - d.size / 2; })
    .attr('fill', function (d) { return d.color; });

var ellipses = shapes.filter(function (d) { return d.shape === 'ellipse'; })
  .append('ellipse')
    .attr('rx', function (d) { return d.size / 2.5; })
    .attr('ry', function (d) { return d.size / 2; })
    .attr('fill', function (d) { return d.color; });

var grid = d3.layout.grid()
  .width(width)
  .height(height)
  .colWidth(50)
  .rowHeight(50)
  .marginTop(75)
  .marginLeft(50)
  .sectionPadding(100)
  .data(data);

function transition () {
  updateLabels();
  svg.attr('height', grid.height());
  shapes.transition()
    .duration(750)
    .delay(function (d) { return delayScale(d.groupIndex * 150 + d.index * 1); })
    .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
}

function updateLabels () {
  var groups = grid.groups();

  // Provide d3 a key function so that labels are animated correctly
  // http://bost.ocks.org/mike/constancy/
  var labels = svg.selectAll('text').data(groups, function (d) { return d.name; });
  labels.enter()
    .append('text')
      .attr('y', function (d) { return d.y - 40; })
      .style('opacity', 0);
  labels.exit()
      .transition()
      .style('opacity', 0)
    .remove();

  labels
    .text(function (d) { return capitalize(d.name) + ': (' + d.data.length + ')'; })
    .transition()
      .duration(750)
      .attr('x', 30)
      .attr('y', function (d) { return d.y - 40; })
      .style('opacity', 1);
}

function sortGroupAscend () {
  grid.sort(ascending);

  updateLabels();
  transition();
}

function sortGroupDescend () {
  grid.sort(descending);

  updateLabels();
  transition();
}

function sortSizeAscend () {
  grid.sort(null, ascending);
  transition();
}

function sortSizeDescend () {
  grid.sort(null, descending);
  transition();
}

function sortRandom () {
  grid.sort(randomComparator, randomComparator)
  transition();
}

function groupByShape () {
  grid.groupBy('shape');
  transition();
}

function groupBySize () {
  grid.groupBy(function (d) {
    return sizeScale(d.size);
  });
  transition();
}

function groupByColor () {
  grid.groupBy('color');
  transition();
}

groupByShape();

document.getElementById('group-ascend').onclick = sortGroupAscend;
document.getElementById('group-descend').onclick = sortGroupDescend;
document.getElementById('size-ascend').onclick = sortSizeAscend;
document.getElementById('size-descend').onclick = sortSizeDescend;
// document.getElementById('random').onclick = sortRandom;
document.getElementById('groupby-shape').onclick = groupByShape;
document.getElementById('groupby-size').onclick = groupBySize;
document.getElementById('groupby-color').onclick = groupByColor;
