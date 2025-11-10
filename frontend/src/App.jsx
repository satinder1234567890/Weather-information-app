import { useState, useEffect, useRef } from 'react';
import WeatherForm from './components/WeatherForm';
import WeatherCard from './components/WeatherCard';

export default function App() {
  const [weatherList, setWeatherList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');
  const intervalRef = useRef();

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/weather?city=${encodeURIComponent(cityName)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setWeatherList(data);
      setCity(cityName);
    } catch (e) {
      setWeatherList(null);
      setError(e.message);
      setCity('');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (city) {
      intervalRef.current = setInterval(() => {
        fetchWeather(city);
      }, 300000);
    }
    return () => clearInterval(intervalRef.current);
  }, [city]);

  const refreshWeather = () => {
    if (city) fetchWeather(city);
  };

  // Convert forecast array to XML string for export
  const toXML = (dataList) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?><forecast>';
    dataList.forEach((day) => {
      xml += `
  <day>
    <date>${day.date}</date>
    <minTemp>${day.minTemp}</minTemp>
    <maxTemp>${day.maxTemp}</maxTemp>
    <avgHumidity>${day.avgHumidity}</avgHumidity>
    <avgPressure>${day.avgPressure}</avgPressure>
    <avgWindSpeed>${day.avgWindSpeed}</avgWindSpeed>
    <condition>${day.condition}</condition>
  </day>`;
    });
    xml += '</forecast>';
    return xml;
  };

  // Convert forecast array to CSV string for export
  const toCSV = (dataList) => {
    const header = "Date,Min Temp (°C),Max Temp (°C),Humidity (%),Pressure (hPa),Wind Speed (m/s),Condition\n";
    const rows = dataList.map(day => 
      `${day.date},${parseFloat(day.minTemp).toFixed(1)},${parseFloat(day.maxTemp).toFixed(1)},${parseFloat(day.avgHumidity).toFixed(0)},${parseFloat(day.avgPressure).toFixed(1)},${parseFloat(day.avgWindSpeed).toFixed(1)},${day.condition}`
    );
    return header + rows.join('\n');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportXML = () => {
    if (!weatherList) return;
    const xml = toXML(weatherList);
    downloadFile(xml, `${city}_forecast.xml`, 'application/xml');
  };

  const exportExcel = () => {
    if (!weatherList) return;
    const csv = toCSV(weatherList);
    downloadFile(csv, `${city}_forecast.csv`, 'text/csv');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-50 via-blue-50 to-purple-50 flex flex-col items-center p-8 font-sans">
      <header className="mb-12 max-w-3xl text-center px-4">
        <h1 className="text-5xl font-extrabold text-blue-800 mb-4 flex justify-center items-center gap-3">
          🌦️ Weather Information App 🌈
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Your friendly and reliable companion to check the latest weather conditions anywhere in the world. Simply enter a city name, and get real-time temperature, humidity, pressure, wind speed, and weather condition details — all presented clearly and beautifully.
        </p>
        <p className="text-md text-blue-700 font-semibold">
          Stay Prepared, Stay Happy! ☀️⛅🌧️❄️
        </p>
      </header>

      <WeatherForm onSubmit={fetchWeather} loading={loading} />

      {error && (
        <div className="mt-6 max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md" role="alert">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
        </div>
      )}

      {weatherList && (
        <>
          <WeatherCard dataList={weatherList} />
          <div className="mt-6 space-x-4 flex justify-center">
            <button
              onClick={refreshWeather}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded shadow transition disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? 'Refreshing... 🔄' : 'Refresh Latest Weather 🔄'}
            </button>
            <button
              onClick={exportExcel}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded shadow transition"
            >
              Export Excel 📊
            </button>
            <button
              onClick={exportXML}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded shadow transition"
            >
              Export XML 📄
            </button>
          </div>
        </>
      )}

      <footer className="mt-auto pt-16 pb-6 text-sm text-gray-400 text-center w-full">
        &copy; 2025 Weather Information App — Built with ☀️ React & Java Backend
      </footer>
    </div>
  );
}
