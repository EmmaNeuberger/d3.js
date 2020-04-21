// @TODO: YOUR CODE HERE!

// SVG area dimensions
var svgWidth = 1000;
var svgHeight = 600;

// Margins -chart
var margin = {
  top: 20,
  right: 30,
  bottom: 100,
  left: 100,
};

// Dimensions of Chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Set dimensions
var svg = d3.select('#scatter')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

// Translate SVG 
var chartGroup = svg
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// chosen X - Y
var chosenXAxis = 'poverty';
var chosenYAxis = 'healthcare';


// Tooltip Update
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var labelX;
  var labelXX;
  var labelXXX;

  var labelY;

  if (chosenXAxis === 'poverty') {
    labelX = 'poverty';
    labelXX = '%';
    labelXXX = '';
  } else if (chosenXAxis === 'age') {
    labelX = 'age';
    labelXX = '';
    labelXXX = '';
  } else {
    labelX = 'income';
    labelXX = '';
    labelXXX = '$';
  }

  if (chosenYAxis === 'healthcare') {
    labelY = 'healthcare';
  } else if (chosenYAxis === 'smokes') {
    labelY = 'smokes';
  } else {
    labelY = 'obesity';
  }

  var toolTip = d3
    .tip()
    .attr('class', 'd3-tip')
    .offset([80, -60])
    .html(function (d) {
      return `${d.state}<br>${labelX}: ${labelXXX} ${d[chosenXAxis]}${labelXX}<br>${labelY}: ${d[chosenYAxis]}%`;
    });

  circlesGroup.call(toolTip);

  circlesGroup
    .on('mouseover', function (data) {
      toolTip.show(data);
    })
    // onmouseout event
    .on('mouseout', function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


// Update Y-scale
function yScale(data, chosenYAxis) {
  var yScaleLinear = d3.scaleLinear().domain([
      d3.min(data, (d) => d[chosenYAxis]) * 0.8 - 1,
      d3.max(data, (d) => d[chosenYAxis]) * 1.2,
    ])
    .range([height, 0]);

  return yScaleLinear;
}


function xScale(data, chosenXAxis) {
  var xScaleLinear = d3.scaleLinear().domain([
      d3.min(data, (d) => d[chosenXAxis]) * 0.8,
      d3.max(data, (d) => d[chosenXAxis]) * 1.2,
    ])
    .range([0, width]);

  return xScaleLinear;
}

// Update x
function updateX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition().duration(500).call(bottomAxis);
  return xAxis;
}

// Update y
function updateY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition().duration(500).call(leftAxis);
  return yAxis;
}

// Set Radius
var radius = 20;

// cx Transition
function xCirclePopulate(circlesGroup, newXScale, chosenXAxis) {circlesGroup.transition()
    .duration(500)
    .attr('cx', (d) => newXScale(d[chosenXAxis]));
  return circlesGroup;
}

// cy Transition
function yCirclePopulate(circlesGroup, newYScale, chosenYAxis) {circlesGroup.transition()
    .duration(500)
    .attr('cy', (d) => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv('assets/data/data.csv')
  .then(function (data, err) {
    console.log('data:', data);
    if (err) throw err;

    // parse data
    data.forEach(function (d) {
      d.poverty = +d.poverty;
      d.age = +d.age;
      d.income = +d.income;
      d.healthcare = +d.healthcare;
      d.obesity = +d.obesity;
      d.smokes = +d.smokes;
    });

    // xScaleLinear function above csv import
    var xScaleLinear = xScale(data, chosenXAxis);
    var yScaleLinear = yScale(data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xScaleLinear);
    var leftAxis = d3.axisLeft(yScaleLinear);

    // append x axis
    var xAxis = chartGroup
      .append('g')
      .classed('x-axis', true)
      .attr('transform', `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append('g').call(leftAxis);

    var colors = [
      'green'
    ];
    var colorScale = d3.scaleOrdinal().range(colors);

    // append initial circles
    var circlesGroup = chartGroup
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScaleLinear(d[chosenXAxis]))
      .attr('cy', (d) => yScaleLinear(d[chosenYAxis]))
      .attr('r', radius)
      .attr('class', function (d) {
        return 'stateCircle ' + d.abbr;
      })
      .attr('opacity', '1')
      .style('fill', function (d, i) {
        return colorScale(i);
      });

    // Create group for  2 x- axis labels
    var labelsGroup = chartGroup
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup
      .append('text')
      .attr('x', 0)
      .attr('y', 20)
      .attr('value', 'poverty') 
      .classed('active', true)
      .text('In Poverty (%)');

    var ageLabel = labelsGroup
      .append('text')
      .attr('x', 0)
      .attr('y', 40)
      .attr('value', 'age')
      .classed('inactive', true)
      .text('Age (Median)');

    var incomeLabel = labelsGroup
      .append('text')
      .attr('x', 0)
      .attr('y', 60)
      .attr('value', 'income')
      .classed('inactive', true)
      .text('Household Income (Median)');

    // append y axis

    var healthcareYLabel = chartGroup
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('value', 'healthcare') // value to grab for event listener
      .attr('dy', '4em')
      .classed('y-axis-text', true)
      .classed('active', true)
      .text('Lacks Healthcare (%)');

    var smokesYLabel = chartGroup
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('value', 'smokes') 
      .attr('dy', '2.5em')
      .classed('y-axis-text', true)
      .classed('inactive', true)
      .text('Smokes (%)');

    var obesityYLabel = chartGroup
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('value', 'obesity') // value to grab for event listener
      .attr('dy', '1em')
      .classed('y-axis-text', true)
      .classed('inactive', true)
      .text('Obese (%)');

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll('text').on('click', function () {
      // get value of selection
      var value = d3.select(this).attr('value');
      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;

        xScaleLinear = xScale(data, chosenXAxis);
        xAxis = updateX(xScaleLinear, xAxis);
        circlesGroup = xCirclePopulate(circlesGroup, xScaleLinear, chosenXAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        //updates states info
        states = updateState(
          chosenXAxis,
          chosenYAxis,
          xScaleLinear,
          yScaleLinear,
          states
        );

        // changes classes to change bold text
        if (chosenXAxis === 'poverty') {
          povertyLabel.classed('active', true).classed('inactive', false);
          ageLabel.classed('active', false).classed('inactive', true);
          incomeLabel.classed('active', false).classed('inactive', true);
        } else if (chosenXAxis == 'age') {
          ageLabel.classed('active', true).classed('inactive', false);
          povertyLabel.classed('active', false).classed('inactive', true);
          incomeLabel.classed('active', false).classed('inactive', true);
        } else {
          incomeLabel.classed('active', true).classed('inactive', false);
          povertyLabel.classed('active', false).classed('inactive', true);
          ageLabel.classed('active', false).classed('inactive', true);
        }
      }
    });

    // y axis labels event listener
    chartGroup.selectAll('.y-axis-text').on('click', function () {
      // get value of selection
      var value = d3.select(this).attr('value');
      if (value !== chosenYAxis) {
        // replaces chosenXAxis with value
        chosenYAxis = value;

        yScaleLinear = yScale(data, chosenYAxis);
        yAxis = updateY(yScaleLinear, yAxis);
        circlesGroup = yCirclePopulate(circlesGroup, yScaleLinear, chosenYAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);s

        // changes classes to change bold text
        if (chosenYAxis === 'healthcare') {
          healthcareYLabel.classed('active', true).classed('inactive', false);
          smokesYLabel.classed('active', false).classed('inactive', true);
          obesityYLabel.classed('active', false).classed('inactive', true);
        } else if (chosenYAxis == 'smokes') {
          smokesYLabel.classed('active', true).classed('inactive', false);
          healthcareYLabel.classed('active', false).classed('inactive', true);
          obesityYLabel.classed('active', false).classed('inactive', true);
        } else {
          obesityYLabel.classed('active', true).classed('inactive', false);
          healthcareYLabel.classed('active', false).classed('inactive', true);
          smokesYLabel.classed('active', false).classed('inactive', true);
        }
      }
    });
  })
  .catch(function (error) {
    console.log(error);
  });
