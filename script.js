const dataUrl = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';

const init = () => {

  // define constants
  const animationStep = 200;
  const nodeRadius = 3;
  const forceCharge = -50;
  const linkDistance = 20;
  const { nodes, links } = data;
  let w = window.innerWidth;
  let h = window.innerHeight;
  const margin = {
    left: 20,
    right: 20,
    top: 20,
    bottom: 20,
  };

  //initialize svg
  const svg = d3.select("body")
    .append("svg")
    .attr('width', w - margin.right - margin.left)
    .attr('height', h - margin.top - margin.bottom)
    .attr("class", "graph")
    .attr("id", "graph");

  // initialize tooltips
  const tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html((d) => {
      return `<div class='tip-name'>${d.country}</div>`;
    });

  svg.call(tip);

  // initialize simulation
  const simulation = d3.forceSimulation()
    .force("link", d3.forceLink())
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(w / 2, h / 2));

  // initialize links
  const link = svg.append("g")
    .attr("class", "link")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line");

  // initialize nodes
  const node = svg.selectAll('node')
    .data(nodes)
    .enter()
    .append('img')
    .attr('class', d => `flag flag-${d.code}`)
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
      );

   // define tick function
  const ticked = () => {
    link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

    node
      .style('left', d => `${(d.x - 8)}px`)
      .style('top', d => `${(d.y - 5)}px`);
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
  d.fx = d3.event.x;
  d.fy = d3.event.y;
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