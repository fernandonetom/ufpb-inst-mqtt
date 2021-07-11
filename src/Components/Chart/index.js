/* eslint-disable react/prop-types */
import React, {
  memo, forwardRef, useImperativeHandle, useRef,
} from 'react';
import { Line } from 'react-chartjs-2';

const Chart = forwardRef((props, ref) => {
  const chartRef = useRef();
  useImperativeHandle(ref, () => chartRef.current, [props.chartData]);
  return (
    <>
      <Line
        ref={chartRef}
        data={props.chartData}
        options={{
        // animation: false,
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
    </>
  );
});
export default memo(Chart);
