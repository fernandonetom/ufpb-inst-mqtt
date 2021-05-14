document.addEventListener('DOMContentLoaded', () => {
  const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
  client.subscribe('mqtt/ufpb-inst-test');

  client.on('message', function (topic, payload) {
    try {
      const number = parseFloat(payload.toString());
      updateChart(number);
    } catch (e) {
      console.log(e.message);
    }
  });
  client.on('connect', () => {
    setTimeout(infoHide, 1000);
  });
  // setInterval(() => {
  //   client.publish(
  //     'mqtt/ufpb-inst-test',
  //     (Math.floor(Math.random() * 6) + 1).toString()
  //   );
  // }, 2000);

  let config = {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Temperatura',
          backgroundColor: '#42a5f5',
          borderColor: '#42a5f5',
          data: [],
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Chart.js Line Chart',
      },
      scales: {
        y: {
          suggestedMin: 0,
          suggestedMax: 50,
        },
      },
      interaction: {
        mode: 'nearest',
        intersect: false,
      },
    },
  };

  const ctx = document.getElementById('canvas').getContext('2d');
  window.myLine = new Chart(ctx, config);

  const logs = document.getElementById('logs');

  const limit = 10;

  const updateChart = (number) => {
    if (config.data.datasets.length > 0) {
      const date = new Date();
      const hours = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      const copyData = config.data.labels.slice((limit - 1) * -1);

      copyData.push(hours);
      config.data.labels = copyData;

      config.data.datasets.forEach(function (dataset) {
        const copyData = dataset.data.slice((limit - 1) * -1);
        copyData.push(number);

        logs.innerHTML += `${hours} - Recebeu ${number} ºC<br />`;

        dataset.data = copyData;
      });

      window.myLine.update();
    }
  };
  infoShow(
    '<h3>Conectando </h3><img width="100px" src="https://media3.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" />'
  );
  function infoShow(text) {
    const info = document.getElementById('info');
    const canvas = document.getElementById('canvas');
    info.innerHTML = text;
    info.style.display = 'flex';
    canvas.style.display = 'none';
  }
  function infoHide() {
    const info = document.getElementById('info');
    const canvas = document.getElementById('canvas');
    info.style.display = 'none';
    canvas.style.display = 'block';
  }
});
