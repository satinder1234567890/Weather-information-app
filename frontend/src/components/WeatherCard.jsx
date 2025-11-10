export default function WeatherCard({ dataList }) {
  return (
    <div className="mt-8 max-w-5xl w-full bg-white rounded-lg shadow-md p-10 border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">5 Day Weather Forecast</h2>
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-10">
        {dataList.map((day) => (
          <div key={day.date}
            className="flex-1 min-w-[220px] max-w-[250px] bg-blue-50 p-6 rounded-2xl shadow-lg transition hover:scale-105 duration-150 border border-blue-200"
          >
            <div className="font-semibold text-lg mb-3 text-blue-800">
              {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <div className="mb-2">
              <span className="text-gray-700">Condition: </span>
              <span className="capitalize font-medium">{day.condition}</span>
            </div>
            <div>Min Temp: <span className="font-semibold">{parseFloat(day.minTemp).toFixed(1)} °C</span></div>
            <div>Max Temp: <span className="font-semibold">{parseFloat(day.maxTemp).toFixed(1)} °C</span></div>
            <div>Humidity: {parseFloat(day.avgHumidity).toFixed(0)} %</div>
            <div>Pressure: {parseFloat(day.avgPressure).toFixed(1)} hPa</div>
            <div>Wind Speed: {parseFloat(day.avgWindSpeed).toFixed(1)} m/s</div>
          </div>
        ))}
      </div>
    </div>
  );
}
