import React from 'react';
import { Line } from 'react-chartjs-2';

export default function Home() {
  return (
    <>
      <section className="container" id="canvasContainer">
        <div className="canvasContainer">
          <h3>Gráfico</h3>
          <Line
            data={{
              labels: ['20:00', '20:05', '20:06'],
              datasets: [
                {
                  label: 'Temperatura',
                  backgroundColor: '#4ECCA3',
                  borderColor: '#4ECCA3',
                  data: [30, 35, 96],
                  fill: false,
                  tension: 0.5,
                },
              ],
            }}
            options={{
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
            }}
          />
        </div>
        <div className="infoContainer">
          <h3>dados recebidos</h3>
          <div id="logs" />
          <div className="acoes">
            <button type="button" id="start">iniciar</button>
            <button type="button" id="save">salvar</button>
          </div>
        </div>
      </section>
    </>
  );
}
