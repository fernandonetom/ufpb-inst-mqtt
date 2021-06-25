document.addEventListener('DOMContentLoaded', () => {
  // const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
  const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
  const data = [];

  const tempTopic = 'mqtt/ufpb-inst/temp';
  const controlTopic = 'mqtt/ufpb-inst/control';
  const startButton = document.getElementById('start');
  let start = false;
  let intervalo;
  client.on('message', function (topic, payload) {
    console.log(payload.toString());
    console.log(topic.toString());
    switch (topic) {
      case 'mqtt/ufpb-inst/temp':
        try {
          console.log(payload.toString());
          const number = parseFloat(payload.toString());
          if (!isNaN(number)) updateChart(number);
        } catch (e) {
          console.log(e.message);
        }
        break;
      case 'mqtt/ufpb-inst/control':
        console.log(payload.toString());
        const message = payload.toString();
        if (message === 'start') {
          start = true;
          startButton.innerText = 'parar';
          // intervalo = setInterval(async () => {
          //   const { data } = await axios.get('/cgi-bin/entrada-analogica');

          //   const valor = data.replace(/\D/g, '');
          //   console.log('enviou', valor);

          //   client.publish(tempTopic, valor.toString());
          // }, 2000);
        } else {
          start = false;
          startButton.innerText = 'iniciar';
          clearInterval(intervalo);
        }
      default:
        break;
    }
  });
  client.on('connect', () => {
    setTimeout(infoHide, 1000);
    toastr.success('Conectado!');
    client.subscribe(tempTopic);
    client.subscribe(controlTopic);
  });

  let config = {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Temperatura',
          backgroundColor: '#4ECCA3',
          borderColor: '#4ECCA3',
          data: [],
          fill: false,
          tension: 0.5,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          title: {
            display: true,
            text: 'Temperatura',
            color: '#EEEEEE',
          },
          suggestedMin: 0,
          suggestedMax: 50,
          ticks: {
            color: '#EEEEEE',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Tempo',
            color: '#EEEEEE',
          },
          ticks: {
            color: '#EEEEEE',
          },
        },
      },
      interaction: {
        mode: 'nearest',
        intersect: false,
      },
      color: '#EEEEEE',
    },
  };

  const ctx = document.getElementById('canvas').getContext('2d');
  window.myLine = new Chart(ctx, config);

  const logs = document.getElementById('logs');

  const limit = 10;

  const updateChart = (value) => {
    if (config.data.datasets.length > 0) {
      const number = ((parseFloat(value) * 100) / 4095).toFixed(2);

      const date = new Date();
      const hours = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      const copyData = config.data.labels.slice((limit - 1) * -1);

      copyData.push(hours);
      config.data.labels = copyData;

      config.data.datasets.forEach(function (dataset) {
        const copyData = dataset.data.slice((limit - 1) * -1);
        copyData.push(number);

        data.unshift({ hours, number });

        logs.innerHTML = '';
        data.forEach((item) => {
          logs.innerHTML += `<div class="log">
          <div class="logHora">${item.hours}</div>
          <div class="separador"></div>
          <div class="logDado">${item.number}ºC</div>
          </div>`;
        });

        dataset.data = copyData;
      });

      window.myLine.update();
    }
  };
  infoShow(
    '<h3>Conectando </h3><img width="100px" src="https://media3.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" />'
  );
  function infoShow() {
    const info = document.getElementById('statusInfo');
    info.innerHTML = `
    <div class="loading">
        <div class="lds-facebook">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <div class="status">Conectando...</div>
    `;
  }
  function infoHide() {
    const info = document.getElementById('statusInfo');
    info.innerHTML =
      '<div class="status"><i class="fa fa-check"></i> Conectado</div>';
    info.style.color = 'var(--green-light)';
  }

  const saveButton = document.getElementById('save');
  saveButton.addEventListener('click', () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      data.map((e) => `${e.hours};${e.number}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'dados.csv');
    document.body.appendChild(link);
    link.click();
    toastr.info('Arquivo .csv gerado!', 'Sucesso!');
  });

  startButton.addEventListener('click', () => {
    try {
      //client.publish(controlTopic, 'start');
      //startButton.innerText = '...';
      //startButton.setAttribute('disabled', 'disabled');
      if (start) {
        // clearInterval(intervalo);
        startButton.innerText = 'iniciar';
        client.publish(controlTopic, 'stop');
      } else {
        startButton.innerText = 'parar';
        // intervalo = setInterval(async () => {
        //   const { data } = await axios.get('/cgi-bin/entrada-analogica');

        //   const valor = (
        //     (parseFloat(data.replace(/\D/g, '')) * 100) /
        //     4095
        //   ).toFixed(2);
        //   console.log('enviou', valor);

        //   client.publish(tempTopic, valor.toString());
        // }, 2000);
        client.publish(controlTopic, 'start');
      }
      start = !start;
    } catch (error) {
      console.log('erro ao comeÃ§ar');
    }
  });
});
