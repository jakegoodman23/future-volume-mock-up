const parseTime = d3.timeParse("%Y-%m-%d");

d3.csv("data/future_volume.csv").then((data) => {
  data.forEach((d) => {
    d.result = Number(d.result);
    d.predictedCount = Number(d.predictedCount);
    d.historicalCount = Number(d.historicalCount);
    d.dayOfWeek = parseTime(d.date).getDay();
  });

  let filteredData;
  let dates;
  let scheduledCases;
  let predictedCases;
  let historicalCases;
  let daysIncluded;

  function createArrays(data) {
    dates = data.map(function (d) {
      return d.date;
    });
    scheduledCases = data.map(function (d) {
      return d.result;
    });
    predictedCases = data.map(function (d) {
      return d.predictedCount;
    });
    historicalCases = data.map(function (d) {
      return d.historicalCount;
    });
  }

  daysIncluded = $("#day-filter").val();
  daysIncluded = daysIncluded.map(Number);
  filteredData = data.filter(function (d) {
    return daysIncluded.indexOf(d.dayOfWeek) >= 0;
  });
  createArrays(filteredData);

  function addChart(label, schedData, predData, histData) {
    var mixedChart = new Chart(document.getElementById("mixed-chart"), {
      type: "bar",
      data: {
        labels: label,
        datasets: [
          {
            label: "Scheduled Volume",
            type: "bar",
            backgroundColor: "#202FFF",
            data: schedData,
          },
          {
            label: "Predicted Volume",
            type: "line",
            borderColor: "orange",
            data: predData,
            fill: false,
          },
          {
            label: "Historical Volume",
            type: "line",
            borderColor: "gray",
            data: histData,
            fill: false,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Future Volume (next 30 days)",
            font: {
              size: 25,
            },
          },
        },
        scales: {
          y: {
            title: {
              display: true,
              text: "Case Volume",
              font: {
                size: 15,
              },
            },
            grid: {
              // display: false,
            },
          },
          x: {
            title: {
              display: true,
              text: "Date",
              font: {
                size: 15,
              },
            },
            grid: {
              display: false,
            },
          },
        },
        legend: { display: true },
      },
    });
    return mixedChart;
  }

  mainChart = addChart(dates, scheduledCases, predictedCases, historicalCases);

  $(document).on("click", "#apply-filters", function () {
    daysIncluded = $("#day-filter").val();
    daysIncluded = daysIncluded.map(Number);

    thresholdVal = $("#threshold-filter").val();
    filteredData = data.filter(function (d) {
      return daysIncluded.indexOf(d.dayOfWeek) >= 0;
    });

    if (thresholdVal === "high_diff") {
      console.log("test");
      filteredData = filteredData.filter(function (d) {
        return (
          Math.abs((d.historicalCount - d.predictedCount) / d.historicalCount) *
            100 >=
          30
        );
      });
    }

    createArrays(filteredData);

    mainChart.destroy();

    mainChart = addChart(
      dates,
      scheduledCases,
      predictedCases,
      historicalCases
    );
  });
});
