d3.csv("data/data.csv").then((csv) => {
  const months = [
    { value: 1, name: "Jan", season: "Winter" },
    { value: 2, name: "Feb", season: "Winter" },
    { value: 3, name: "Mar", season: "Spring" },
    { value: 4, name: "Apr", season: "Spring" },
    { value: 5, name: "May", season: "Spring" },
    { value: 6, name: "Jun", season: "Summer" },
    { value: 7, name: "Jul", season: "Summer" },
    { value: 8, name: "Aug", season: "Summer" },
    { value: 9, name: "Sep", season: "Fall" },
    { value: 10, name: "Oct", season: "Fall" },
    { value: 11, name: "Nov", season: "Fall" },
    { value: 12, name: "Dec", season: "Winter" },
  ];

  const data = processData(csv);
  function processData(csv) {
    return csv.map((d) => {
      const values = Object.fromEntries(
        csv.columns.slice(1).map((c) => [c, d[c] === "TRUE"]),
      );
      return {
        name: d["Produce"],
        values,
      };
    });
  }

  const width = 280;
  const r = width / 2;
  const labelLayerSize = 20;
  const rSeason = r - labelLayerSize;
  const rMonth = rSeason - labelLayerSize;
  const donutLayerSize = 28;
  const rDonutOuter = rMonth;
  const rDonutInner = rDonutOuter - donutLayerSize;

  const aScale = d3
    .scaleBand()
    .domain(months.map((d) => d.value))
    .range([(-1 / 12) * Math.PI, 2 * Math.PI - (1 / 12) * Math.PI]);

  const radToDeg = (rad) => (rad / Math.PI) * 180 + 90;

  const arc = d3.arc().innerRadius(rDonutInner).outerRadius(rDonutOuter);

  const container = d3.select("#charts");

  const defs = container
    .append("svg")
    .attr("class", "chart-components")
    .attr("width", 0)
    .attr("height", 0)
    .append("defs");

  defs
    .append("g")
    .attr("class", "text-paths")
    .selectChildren(".text-path")
    .data([
      {
        id: "monthTextPathClockwise",
        r: rMonth + labelLayerSize / 2,
        anticlockwise: false,
      },
      {
        id: "monthTextPathAnticlockwise",
        r: rMonth + labelLayerSize / 2,
        anticlockwise: true,
      },
      {
        id: "seasonTextPathClockwise",
        r: rSeason + labelLayerSize / 2,
        anticlockwise: false,
      },
      {
        id: "seasonTextPathAnticlockwise",
        r: rSeason + labelLayerSize / 2,
        anticlockwise: true,
      },
    ])
    .join("path")
    .attr("class", "text-path")
    .attr("id", (d) => d.id)
    .attr("d", (d) => {
      const p = d3.path();
      p.arc(0, 0, d.r, 0, Math.PI * 2, d.anticlockwise);
      return p.toString();
    });

  const componentsG = defs
    .append("g")
    .attr("id", "chartComponents")
    .attr("class", "chart-components");

  componentsG
    .append("g")
    .attr("class", "ticks")
    .selectChildren(".tick")
    .data(aScale.domain())
    .join("line")
    .attr("class", "tick")
    .attr("x1", rMonth)
    .attr("x2", (d) => (d % 3 === 0 ? r : rSeason))
    .attr("transform", (d) => `rotate(${radToDeg(aScale(d))})`);

  componentsG
    .append("g")
    .attr("class", "month-labels")
    .selectChildren(".month-label")
    .data(months)
    .join("text")
    .attr("class", "month-label")
    .attr("dy", "0.32em")
    .attr("text-anchor", "middle")
    .attr(
      "transform",
      (d) => `rotate(${radToDeg(aScale(d.value) + aScale.bandwidth() / 2)})`,
    )
    .append("textPath")
    .attr("href", (d) => {
      const a = aScale(d.value) + aScale.bandwidth();
      return a > Math.PI / 2 && a < (Math.PI / 2) * 3
        ? "#monthTextPathAnticlockwise"
        : "#monthTextPathClockwise";
    })
    .attr("startOffset", "50%")
    .text((d) => d.name);

  componentsG
    .append("g")
    .attr("class", "season-labels")
    .selectChildren(".season-label")
    .data(months.filter((d) => d.value % 3 === 1))
    .join("text")
    .attr("class", "season-label")
    .attr("dy", "0.32em")
    .attr("text-anchor", "middle")
    .attr(
      "transform",
      (d) => `rotate(${radToDeg(aScale(d.value) + aScale.bandwidth() / 2)})`,
    )
    .append("textPath")
    .attr("href", (d) => {
      const a = aScale(d.value) + aScale.bandwidth();
      return a > Math.PI / 2 && a < (Math.PI / 2) * 3
        ? "#seasonTextPathAnticlockwise"
        : "#seasonTextPathClockwise";
    })
    .attr("startOffset", "50%")
    .text((d) => d.season);

  const chart = container
    .selectChildren(".chart")
    .data(data)
    .join("div")
    .attr("class", "chart");

  const svg = chart
    .append("svg")
    .attr("width", width)
    .attr("height", width)
    .attr("viewBox", [-r, -r, width, width]);

  svg.append("use").attr("href", "#chartComponents");

  svg
    .append("text")
    .attr("class", "title")
    .attr("text-anchor", "middle")
    .attr("dy", "0.32em")
    .text((d) => d.name);

  svg
    .append("g")
    .attr("class", "donut-fills")
    .selectChildren(".donut-fill")
    .data((d) => months.filter((m) => d.values[m.value] === true))
    .join("path")
    .attr("class", "donut-fill")
    .attr("fill", (d) => `var(--color-${d.season.toLowerCase()})`)
    .attr("d", (d) => {
      const startAngle = aScale(d.value);
      const endAngle = startAngle + aScale.bandwidth();
      return arc({ startAngle, endAngle });
    });
});
