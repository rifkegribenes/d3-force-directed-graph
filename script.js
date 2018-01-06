const dataUrl = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';

let simulation;

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

let w, h;

const color = d3.scaleSequential(d3.interpolateRainbow)
    .domain(d3.range(5));

const colorCode = (str) => str.charCodeAt(0) - 97;

const init = () => {

  // define constants
  const { nodes, links } = data;
  const headerHeight = document.getElementById('header').clientHeight;
  w = window.innerWidth;
  h = window.innerHeight - headerHeight;
  if (w < h) {
    h = w;
  } else {
    w = h;
  }
  const r = 18;
  const margin = {
    left: 20,
    right: 20,
    top: 20,
    bottom: 20,
  };

  //initialize svg
  const svg = d3.select('body')
    .append("svg")
    .attr('width', w - margin.right - margin.left)
    .attr('height', h - margin.top - margin.bottom)
    .attr("class", "graph")
    .attr("id", "graph")
    .style('top', `${headerHeight + 1}px`)
    .style('left', `${(window.innerWidth / 2) - (w / 2)}px`);

  // initialize tooltips
  const tip = d3.select("body").append("div")
    .attr("class", "d3-tip")
    .style("display", "none")

  // initialize simulation
  simulation = d3.forceSimulation()
    .force("link", d3.forceLink())
    .force('charge', d3.forceManyBody().strength(-6))
    .force("center", d3.forceCenter((w - margin.right - margin.left) / 2, (h - margin.top - margin.bottom) / 2))
    .force("collide", d3.forceCollide().radius(20).iterations(2));

  // initialize links
  const link = svg.append("g")
    .attr("class", "link")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line");

  // initialize node circles
  const node = svg
    .append("g")
    .attr("class", "node")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
      .attr("r", r)
      .attr("fill", (d) => color(Math.floor(colorCode(d.code)/10)))
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide)
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  d3.select('body').append('div').attr('class', 'flag__wrap');

  const flag = d3.select('.flag__wrap')
    .attr('width', w - margin.right - margin.left)
    .attr('height', h - margin.top - margin.bottom)
    .style('top', `${headerHeight + 1}px`)
    .style('left', `${(window.innerWidth / 2) - (w / 2)}px`)
    .selectAll('.flag')
    .data(nodes)
    .enter()
    .append('img')
    .attr('id', d => d.code)
    .attr('class', d => `flag flag-${d.code}`)
    .on("mouseover", (d) => {
       tip.style("display", "block")
         .style("left", (d3.event.pageX + 8) + "px")
         .style("top", (d3.event.pageY - 40) + "px");
       tip.html(`<div class='tip-name'>${d.country}</div>`)
         .attr('class', 'd3-tip');
       })
     .on("mouseout", (d) => {
       tip.style("display", "none");
       })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
      );

   // define tick function
  const ticked = () => {
    link
        .attr("x1", d => clamp(d.source.x, 0, w))
        .attr("y1", d => clamp(d.source.y, 0, h))
        .attr("x2", d => clamp(d.target.x, 0, w))
        .attr("y2", d => clamp(d.target.y, 0, h));

    node
      .attr("cx", d => `${clamp(d.x + 3, 0, w - 24)}px`)
      .attr("cy", d => `${clamp(d.y - 1, 0, h - 16)}px`);

    flag
      .style('left', d => `${clamp(d.x + 12, 0, w - 24)}px`)
      .style('top', d => `${clamp(d.y + 12, 0, h - 16)}px`);

  }

  simulation
      .nodes(nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(links);

}

const dragstarted = (d) => {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

const dragged = (d) => {
  d.fx = clamp(d3.event.x, 0, w);
  d.fy = clamp(d3.event.y, 0, h);
}

const dragended = (d) => {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
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