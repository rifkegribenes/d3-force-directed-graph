const dataUrl = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';

let svg, data, x = 0, y = 0, xAxis, yAxis, dim, chartWrapper, cellHeight = 0, cellWidth = 0, uniqueYears, margin = { top: 70, right: 30, left: 70, bottom: 70 }, w = 1200, h = .4 * w, minYear, colorScale, baseTemp, xLabel, yLabel, xAxisG, legend;

const updateDimensions = (winWidth, winHeight) => {
  w = winWidth - margin.left - margin.right;
  h = winHeight - margin.top - margin.bottom;

  d3.selectAll('.d3-tip')
    .style("opacity", 0);
}

const render = (dataset) => {
  // update dimensions based on window size
  updateDimensions(window.innerWidth, window.innerHeight);

  // update svg dimensions
  svg
    .attr('width', w + margin.right + margin.left)
    .attr('height', h + margin.top + margin.bottom)

  // initialize tooltips
  const tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html((d) => {
      return `<div class='tip-name'>${months[d.month - 1]} ${d.year}</div><div class='tip-gdp'>${(Math.floor((d.variance + baseTemp) * 1000) / 1000)}°</div>`;
    });

  svg.call(tip);

  // update cell size
  svg.selectAll('.bar')
      .attr("x", (d) => ((d.year - minYear) * cellWidth) + margin.left)
      .attr("y", (d) => ((d.month - 1) * cellHeight) + margin.top)
      .attr("rx", 0)
      .attr("ry", 0)
      .attr("width", cellWidth)
      .attr("height", cellHeight)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

}

window.addEventListener('resize', render);

const init = () => {

  // define constants
  baseTemp = data.baseTemperature;
  const { nodes, links } = data;

  // initialize scales
  x = d3.scaleTime().domain([minDate, maxDate])

  colorScale = d3.scaleQuantile()
    .domain([minVariance + baseTemp, maxVariance + baseTemp])
    .range(colors);

  //initialize svg
  svg = d3.select("body")
    .append("svg")
    .attr('width', w + margin.right + margin.left)
    .attr('height', h + margin.top + margin.bottom)
    .attr("class", "graph")
    .attr("id", "graph");

  // add temp data cells
  const temps = svg.selectAll(".years")
      .data(dataset, (d) => `${d.year}:${d.month}`);

  temps.enter()
      .append("rect")
      .attr("x", (d) => ((d.year - minYear) * cellWidth) + margin.left)
      .attr("y", (d) => ((d.month - 1) * cellHeight) + margin.top)
      .attr("rx", 0)
      .attr("ry", 0)
      .attr("width", cellWidth)
      .attr("height", cellHeight)
      .attr("class", "bar")
      .style("fill", (d) => colorScale(d.variance + baseTemp));

  // add month labels to y axis
  svg.selectAll(".yLabel")
     .data(months)
     .enter()
     .append("text")
     .text((d) => d)
     .attr("x", 0)
     .attr("y", (d, i) => (i * cellHeight) + (margin.top))
     .style("text-anchor", "end")
     .attr("transform", `translate(${margin.left - 6}, ${cellHeight / 1.5})`)
     .attr("class", "yLabel");

   // render
   render(dataset);

 }

const request = new XMLHttpRequest();
request.open('GET', dataUrl, true);

request.onload = () => {
  if (request.status >= 200 && request.status < 400) {
    data = JSON.parse(request.responseText);
    init();
  } else {
    console.log('error fetching data');

  }
};

request.onerror = () => {
  console.log('connection error');
};

request.send();