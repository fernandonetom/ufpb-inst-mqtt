document.addEventListener('DOMContentLoaded', () => {
  // const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
  const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
  const topic = 'mqtt/ufpb-inst/temp';
  client.on('connect', () => {
    setTimeout(infoHide, 1000);
    setInterval(send, 2000);
  });
  infoShow(
    '<h3>Conectando </h3><img width="100px" src="https://media3.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" />'
  );

  function infoShow(text) {
    const info = document.getElementById('info');
    const content = document.getElementById('content');
    info.innerHTML = text;
    info.style.display = 'flex';
    content.style.display = 'none';
  }
  function infoHide() {
    const info = document.getElementById('info');
    const content = document.getElementById('content');
    info.style.display = 'none';
    content.style.display = 'flex';
  }
  const valueLabel = document.getElementById('value');

  const lerBtn = document.getElementById('ler-temp');

  lerBtn.addEventListener('click', async () => {
    try {
      const { data } = await axios.get('/cgi-bin/entrada-analogica');

      const valor = data.replace(/\D/g, '');
      console.log('enviou', valor);
      valueLabel.innerHTML = valor;

      client.publish(topic, valor.toString());
    } catch (error) {
      console.log(error.message);
    }
  });
});
