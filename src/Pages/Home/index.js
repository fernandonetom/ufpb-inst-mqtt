/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import { Line } from 'react-chartjs-2';
import Mqtt from 'mqtt';
import {
  FaTrashAlt, FaCheck, FaTimes, FaUnlink, FaRegPaperPlane, FaSave, FaUndo,
} from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';

import addNotify from '../../Components/Notify';

let mqttClient;
const tempTopic = 'mqtt/ufpb-inst/temp';
const controlTopic = 'mqtt/ufpb-inst/start';
const controllerTopic = 'mqtt/ufpb-inst/controller';

const defaultRefValue = '50';

export default function Home() {
  const [status, setStatus] = useState('desconectado');
  const [isRunning, setIsRunning] = useState(false);
  const [controller, setController] = useState({
    kp: '', ti: '', td: '', ref: '',
  });
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Temperatura Medida',
        backgroundColor: '#4ECCA3',
        borderColor: '#4ECCA3',
        data: [],
        fill: false,
        tension: 0.5,
      },
      {
        label: 'Referência',
        backgroundColor: '#d65a31',
        borderColor: '#d65a31',
        data: [],
        fill: false,
        tension: 0,
      },
    ],
  });
  const tempRef = useRef(defaultRefValue);
  const runningRef = useRef(false);
  const typeRef = useRef('degrau');

  const updateChart = useCallback((value) => {
    const limit = 200;
    if (chartData.datasets.length > 0) {
      const number = ((parseFloat(value) * 100) / 4095).toFixed(2);

      const date = new Date();
      const hours = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

      const newData = chartData;

      const copyData = newData.labels.slice((limit - 1) * -1);
      copyData.push(hours);

      newData.labels = copyData;

      newData.datasets.forEach((dataset, index) => {
        const copy = dataset.data.slice((limit - 1) * -1);

        if (index === 0) {
          copy.push(number);

          setData((prevData) => {
            const aux = [...prevData];
            aux.unshift({ hours, number });
            return aux;
          });
        } else if (runningRef.current) {
          copy.push(tempRef.current);
        } else {
          copy.push(0);
        }
        // eslint-disable-next-line no-param-reassign
        dataset.data = [...copy];
      });

      setChartData({ ...newData });
    }
  }, [chartData]);

  useEffect(() => {
    mqttClient = Mqtt.connect('wss://broker.emqx.io:8084/mqtt');

    mqttClient.on('connect', () => {
      setStatus('conectado');
      try {
        mqttClient.subscribe(tempTopic);
        mqttClient.subscribe(controlTopic);

        addNotify({
          id: '1', title: 'Sucesso', message: 'Os tópicos foram assinados com sucesso.', type: 'success',
        });
      } catch (error) {
        addNotify({ title: 'Erro', message: 'Erro ao tentar assinar os tópicos', type: 'error' });
      }
    });

    mqttClient.on('message', (topic, payload) => {
      const message = payload.toString();
      switch (topic) {
        case 'mqtt/ufpb-inst/temp':
          try {
            const number = parseFloat(message);
            updateChart(number);
          } catch (e) {
            addNotify({ title: 'Erro', message: e.message, type: 'error' });
          }
          break;
        case 'mqtt/ufpb-inst/control':
          if (message === 'start') {
            setIsRunning(true);
          } else {
            setIsRunning(false);
          }
          break;
        default:
          break;
      }
    });
    mqttClient.on('disconnect', () => setStatus('desconectado'));
    mqttClient.on('reconnect', () => setStatus('reconectando'));
    mqttClient.on('error', () => setStatus('erro'));

    return () => {
      mqttClient.unsubscribe(tempTopic);
      mqttClient.unsubscribe(controlTopic);
      return null;
    };
  }, []);

  function getData() {
    const localData = localStorage.getItem('@ufpb-inst/controller');
    if (localData) {
      try {
        const retrieveData = JSON.parse(localData);
        tempRef.current = retrieveData?.ref || defaultRefValue;
        setController({
          kp: retrieveData?.kp || '',
          ti: retrieveData?.ti || '',
          td: retrieveData?.td || '',
          ref: retrieveData?.ref || defaultRefValue,
        });
      } catch (error) {
        addNotify({ title: 'Erro ao localizar dados na memória', message: error.message, type: 'error' });
      }
    }
  }
  useEffect(() => {
    getData();
  }, []);

  function handleStart() {
    mqttClient.publish(controlTopic, isRunning ? 'stp' : typeRef.current);
    runningRef.current = !runningRef.current;
    setIsRunning(!isRunning);
  }

  function handleExport() {
    try {
      const csvContent = `data:text/csv;charset=utf-8,${
        data.reverse().map((e) => `${e.hours};${e.number}`).join('\n')}`;

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'dados.csv');
      document.body.appendChild(link);
      link.click();
      addNotify({
        title: 'Sucesso', message: 'Arquivo dados.csv gerado com sucesso', type: 'info', container: 'bottom-center',
      });
    } catch (error) {
      addNotify({ title: 'Erro ao exportar arquivo', message: error.message, type: 'error' });
    }
  }

  function handleInputChange(e) {
    const { id: name, value } = e.target;

    const copy = { ...controller };
    copy[name] = value.replace(/\D/g, '').replace(/(\d)(\d{2})$/, '$1.$2');
    setController(copy);
  }

  function handleClean() {
    setController({
      kp: '', ti: '', td: '', ref: '',
    });
    localStorage.setItem('@ufpb-inst/controller', null);
  }

  function handleResetData() {
    setData([]);
  }

  function handleSaveData(e) {
    e.preventDefault();

    const {
      kp, td, ti, ref,
    } = controller;

    if (kp === '' || td === '' || ti === '' || ref === '') {
      return addNotify({
        title: 'Alguns dados estão em branco',
        message: 'Verifique os dados do controlador',
        type: 'warning',
        container: 'bottom-center',
        dismiss: {
          duration: 5000,
          onScreen: true,
        },
      });
    }

    try {
      const dataToSend = JSON.stringify({
        kp, td, ti, ref,
      });

      tempRef.current = ref;

      mqttClient.publish(controllerTopic, dataToSend);

      localStorage.setItem('@ufpb-inst/controller', dataToSend);

      return addNotify({
        title: 'Dados aplicados',
        message: `Kp: ${kp} / Ti: ${ti} / td: ${td} / Ref: ${ref}`,
        type: 'success',
        container: 'bottom-center',
      });
    } catch (error) {
      return addNotify({
        title: 'Erro ao aplicar os dados',
        message: error.message,
        type: 'warning',
        container: 'bottom-center',
        dismiss: {
          duration: 5000,
          onScreen: true,
        },
      });
    }
  }

  function handleChangeType(e) {
    typeRef.current = e.target.value;
  }

  return (
    <>
      <section className="container" id="canvasContainer">
        <div className="canvasContainer">
          <h3>Gráfico</h3>
          <Line
            data={chartData}
            options={{
              elements: {
                point: {
                  radius: 0,
                },
              },
              animation: false,
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
          <div className="status">
            <p>Estado da conexão</p>
            <div className="statusName">
              {status === 'conectado' && (
                <>
                  <FaCheck />
                  <span>{status}</span>
                </>
              )}
              {status === 'desconectado' && (
                <>
                  <FaUnlink />
                  <span>{status}</span>
                </>
              )}
              {status === 'erro' && (
                <>
                  <FaTimes />
                  <span>{status}</span>
                </>
              )}
              {status === 'reconectando' && (
                <>
                  <FaRegPaperPlane />
                  {status}
                </>
              )}
            </div>
          </div>

          <div className="infoContent">
            <h3>
              dados recebidos
              {' '}
              <button type="button" onClick={handleResetData} className="clear" data-tip="Limpar todos os dados recebidos">
                <FaTrashAlt />
              </button>
            </h3>
            <div id="logs">
              {data.map((log, index) => (
                <div className="log" key={index}>
                  <div className="logHora">{log.hours}</div>
                  <div className="separador" />
                  <div className="logDado">
                    {log.number}
                    ºC
                  </div>
                </div>
              ))}
            </div>

            <div className="form-control">
              <div className="inline-radio">
                <input type="radio" className="radio" name="x" value="degrau" id="y" onChange={handleChangeType} defaultChecked />
                <label htmlFor="y">Degrau</label>
                <input type="radio" className="radio" name="x" value="controlador" id="z" onChange={handleChangeType} />
                <label htmlFor="z">Controlador</label>
              </div>
              <div className="acoes">
                <button
                  type="button"
                  id="start"
                  onClick={status === 'conectado' ? handleStart : undefined}
                >
                  {isRunning ? 'parar' : 'iniciar'}
                </button>
                <button type="button" id="save" onClick={handleExport}>salvar</button>
              </div>
            </div>
          </div>

        </div>
        <div className="controller">
          <h3>
            Dados do controlador
          </h3>
          <form onSubmit={handleSaveData}>
            <div className="input-group">
              <label htmlFor="kp">Kp</label>
              <input
                type="text"
                id="kp"
                value={controller.kp}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="ti">ti</label>
              <input
                type="text"
                id="ti"
                value={controller.ti}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="td">td</label>
              <input
                type="text"
                id="td"
                value={controller.td}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="ref">ref</label>
              <input
                type="text"
                id="ref"
                value={controller.ref}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className="save" disabled={isRunning}>
              <FaSave />
              Aplicar
            </button>
            <button type="button" className="undo" onClick={handleClean} disabled={isRunning}>
              <FaUndo />
              {' '}
              Limpar
            </button>
          </form>
        </div>
      </section>
      <ReactTooltip type="light" />
    </>
  );
}
