const dataUrl = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';

let simulation;

const init = () => {

  // define constants
  const { nodes, links } = data;
  const headerHeight = document.getElementById('header').clientHeight;
  let w = window.innerWidth;
  let h = window.innerHeight - headerHeight;
  if (w < h) {
    h = w;
  } else {
    w = h;
  }
  const r = 10;
  const margin = {
    left: 20,
    right: 20,
    top: 20,
    bottom: 20,
  };
  // console.log(`window.innerWidth: ${window.innerWidth}`);
  // console.log(`w: ${w}`);
  // console.log(`left of graph: ${window.innerWidth - (w / 2)}`);

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
    // .style("zIndex", 3);
  // const tip = d3.tip()
  //   .attr('class', 'd3-tip')
  //   .offset([-10, 0])
  //   .html((d) => {
  //     return `<div class='tip-name'>${d.country}</div>`;
  //   });

  // svg.call(tip);

  // initialize simulation
  simulation = d3.forceSimulation()
    .force("link", d3.forceLink())
    .force('charge', d3.forceManyBody().strength(-10))
    .force("center", d3.forceCenter((w - margin.right - margin.left) / 2, (h - margin.top - margin.bottom) / 2))
    .force("collide", d3.forceCollide().radius(16).iterations(2));

  // initialize links
  const link = svg.append("g")
    .attr("class", "link")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line");

  // // initialize node circles
  // const node = svg
  //   .append("g")
  //   .attr("class", "node")
  //   .selectAll("circle")
  //   .data(nodes)
  //   .enter().append("circle")
  //     .attr("r", r)
  //     .attr("fill", "white")
  //     .on("mouseover", tip.show)
  //     .on("mouseout", tip.hide)
  //     .call(d3.drag()
  //         .on("start", dragstarted)
  //         .on("drag", dragged)
  //         .on("end", dragended));
  //
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
       });
    // .on("mouseover", (d) => {
    //   tip.style("display", "block");
    //   tip.html(`<div class='tip-name'>${d.country}</div>`)
    //     .style("left", `${d3.event.pageX}px`)
    //     .style("top", `${d3.event.pageY - 28}px`)
    // })
    // .on("mouseout", () => tip.style("display", "none"))
    // .call(d3.drag()
    //   .on("start", dragstarted)
    //   .on("drag", dragged)
    //   .on("end", dragended)
    //   )

   // define tick function
  const ticked = () => {
    link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

    // node
    //   .attr("cx", (d) => d.x = Math.max(r, Math.min(w - margin.left - margin.right - r, d.x)))
    //   .attr("cy", (d) => d.y = Math.max(r, Math.min(h - margin.top - margin.bottom - r, d.y)));

    flag
      .style('left', d => `${(d.x = Math.max(24, Math.min(w - margin.left - margin.right - 24, (d.x + 12))))}px`)
      .style('top', d => `${(d.y = Math.max(24, Math.min(h - margin.top - margin.bottom - 24, (d.y + 12))))}px`);

    // tip
    //   .style('left', d => `${(d.x = Math.max(16, Math.min(w - margin.left - margin.right - 16, (d.x + 16))))}px`)
    //   .style('top', d => `${(d.y = Math.max(11, Math.min(h - margin.top - margin.bottom - 11, (d.y + 11))))}px`);
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