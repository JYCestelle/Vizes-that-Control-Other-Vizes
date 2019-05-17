'use strict';
/*
1. make a filterByYear function

*/

(function() {

  let data = "no data";
  let allYearsData = "no data";
  let svgScatterPlot = ""; // keep SVG reference in global scope
  let svgLineGraph = "";

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgLineGraph = d3.select('body')
      .append('svg')
      .attr('width', 600)
      .attr('height', 600);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("./data/dataEveryYear.csv")
      .then((csvData) => {
        allYearsData = csvData;
        makeLineChart('AUS');
        drawSelector();
      });
  }

  // make scatter plot with trend line
  function makeLineChart(country) {

    filterByCountry(country);
    console.log(country);


    // get population data as array
    let countryData = allYearsData.filter((row) => row["location"] == country);
    let pop_data = countryData.map((row) => +row["pop_mlns"]);
    let timeData = countryData.map((row) => row["time"]);
    console.log(country)

    // find data limits
    let minMax = findMinMax(timeData, pop_data);
  
    let funcs = drawAxes(minMax, "time", "pop_mlns", svgLineGraph, {min: 50, max: 450}, {min: 50, max: 450});
    plotLineGraph(funcs, countryData, country);
  }

  function filterByCountry(country) {
    data = allYearsData.filter((row) => row['Location'] == country);
  }

  function plotLineGraph(funcs, countryData, country) {
    let line = d3.line()
      .x((d) => funcs.x(d)+ 10)
      .y((d) => funcs.y(d));
    
    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    svgLineGraph.append('path')
      .datum(countryData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line)
      .on("mouseover", (d) => {
        svgScatterPlot = div.append('svg')
        .attr('width', 500)
        .attr('height', 500);

        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html(d.location)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
        svgScatterPlot = div.append('svg')
          .attr('width', 280)
          .attr('height', 280)
          .style("background-color", 'lightsteelblue');
        makeScatterPlot(d["location"]);
      })
      .on("mouseout", (d) => {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      });

    svgLineGraph.append('text')
      .attr('x', 230)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Year');

    svgLineGraph.append('text')
      .attr('x', 230)
      .attr('y', 30)
      .style('font-size', '14pt')
      .text(country);

    svgLineGraph.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Population Mins');
  }
    // distinct values in an array
    Array.prototype.unique = function() {
      return this.filter(function (value, index, self) { 
        return self.indexOf(value) === index;
      });
    }
  
    function drawSelector() {
      let locationData = allYearsData.map((row) => row["location"]);
      let location = locationData.unique()
      console.log(location);
  
      let select = d3.select('#filter').append('select')
      .attr('x', 100)
      .attr('y', 40)
      .on('change', change)
      .selectAll('options')
      .data(location)
      .enter()
      .append('option')
      .text(function(d){
        return d;
      })
      .attr('value', function(d){
        return d;
      })
      .property("selected", function (d){
        return d === 'AUS';
      })
    }

  function change(){
    var value = this.value
    console.log(value);
    svgLineGraph.html("");
    makeLineChart(value);
  }

  function makeScatterPlot(year) {

    // get arrays of fertility rate data and life Expectancy data
    let fertility_rate_data = allYearsData.map((row) => parseFloat(row["fertility_rate"]));
    let life_expectancy_data = allYearsData.map((row) => parseFloat(row["life_expectancy"]));

    // find data limits
    let axesLimits = findMinMax(fertility_rate_data, life_expectancy_data);

    // draw axes and return scaling + mapping functions
    let funcs = drawAxes_viz(axesLimits, "fertility_rate", "life_expectancy", svgScatterPlot, {min: 25, max: 225}, {min: 25, max: 225});
  
    // plot data as points and add tooltip functionality
    plotData(funcs);
  }

    // plot all the data points on the SVG
  function plotData(map) {
    
    
    // mapping functions
    let xMap = map.x;
    let yMap = map.y;
    console.log(map.x);
    console.log(map.y);

    // append data to SVG and plot as points
    svgScatterPlot.selectAll('.dot')
      .data(allYearsData)
      .enter()
      .append('circle')
      .attr('cx', xMap)
      .attr('cy', yMap)
      .attr('r', 3)
      .attr('fill', "#4286f4");

    svgScatterPlot.append('text')
      .attr('x', 100)
      .attr('y', 265)
      .style('font-size', '8pt')
      .text('Fertility Rates');

    svgScatterPlot.append('text')
      .attr('x', 80)
      .attr('y', 15)
      .style('font-size', '10pt')
      .text('Life Expectancy (years)');

    svgScatterPlot.append('text')
      .attr('transform', 'translate(8, 180)rotate(-90)')
      .style('font-size', '8pt')
      .text('Life Expectancy (years)');
  }



  // draw the axes and ticks
  function drawAxes(limits, x, y, svg, rangeX, rangeY) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    console.log(limits.xMin)
    console.log(limits.xMax)

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin, limits.xMax]) // give domain buffer room
      .range([rangeX.min, rangeX.max]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svg.append("g")
      .attr('transform', 'translate(10, ' + rangeY.max + ')')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax, limits.yMin]) // give domain buffer
      .range([rangeY.min, rangeY.max]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svg.append('g')
      .attr('transform', 'translate(' + (rangeX.min+10) + ', 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

    // draw the axes and ticks for the viz
    function drawAxes_viz(limits, x, y, svg, rangeX, rangeY) {
      // return x value from a row of data
      let xValue = function(d) { return +d[x]; }

      console.log(limits.xMin)
      console.log(limits.xMax)
  
      // function to scale x value
      let xScale = d3.scaleLinear()
        .domain([limits.xMin-1, limits.xMax+1]) // give domain buffer room
        .range([rangeX.min, rangeX.max]);
  
      // xMap returns a scaled x value from a row of data
      let xMap = function(d) { return xScale(xValue(d)); };
  
      // plot x-axis at bottom of SVG
      let xAxis = d3.axisBottom().scale(xScale);
      svg.append("g")
        .attr('transform', 'translate(10, ' + rangeY.max + ')')
        .call(xAxis);
  
      // return y value from a row of data
      let yValue = function(d) { return +d[y]}
  
      // function to scale y
      let yScale = d3.scaleLinear()
        .domain([limits.yMax+1, limits.yMin-1]) // give domain buffer
        .range([rangeY.min, rangeY.max]);
  
      // yMap returns a scaled y value from a row of data
      let yMap = function (d) { return yScale(yValue(d)); };
  
      // plot y-axis at the left of SVG
      let yAxis = d3.axisLeft().scale(yScale);
      svg.append('g')
        .attr('transform', 'translate(' + (rangeX.min+10) + ', 0)')
        .call(yAxis);
  
      // return mapping and scaling functions
      return {
        x: xMap,
        y: yMap,
        xScale: xScale,
        yScale: yScale
      };
    }


  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
