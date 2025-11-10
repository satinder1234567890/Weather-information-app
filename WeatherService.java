import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.http.*;
import java.text.SimpleDateFormat;
import java.time.*;
import java.util.*;
import javax.xml.parsers.*;
import org.w3c.dom.*;

public class WeatherService {
    private static final String API_KEY = "0858968af7d6261c3caa0848f4223111";

    public static List<DailyWeatherData> getFiveDayForecast(String city) throws Exception {
        String url = "https://api.openweathermap.org/data/2.5/forecast?q="
                + city + "&mode=xml&appid=" + API_KEY + "&units=metric";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("API error: " + response.statusCode());
        }

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new ByteArrayInputStream(response.body().getBytes()));

        NodeList timeNodes = doc.getElementsByTagName("time");
        Map<LocalDate, List<WeatherPoint>> dailyData = new TreeMap<>();

        SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");

        for (int i = 0; i < timeNodes.getLength(); i++) {
            Element timeElement = (Element) timeNodes.item(i);
            String fromStr = timeElement.getAttribute("from");

            Date date = inputFormat.parse(fromStr);
            Instant instant = date.toInstant();
            ZonedDateTime zdt = instant.atZone(ZoneId.systemDefault());
            LocalDate localDate = zdt.toLocalDate();

            Element tempEle = (Element) timeElement.getElementsByTagName("temperature").item(0);
            Element humEle = (Element) timeElement.getElementsByTagName("humidity").item(0);
            Element presEle = (Element) timeElement.getElementsByTagName("pressure").item(0);
            Element windSpeedEle = (Element) timeElement.getElementsByTagName("windSpeed").item(0);
            Element condEle = (Element) timeElement.getElementsByTagName("symbol").item(0);

            double tempValue = Double.parseDouble(tempEle.getAttribute("value"));
            int humidValue = Integer.parseInt(humEle.getAttribute("value"));
            double presValue = Double.parseDouble(presEle.getAttribute("value"));

            // windSpeed may have attribute "mps" for meter/sec
            double windValue = 0.0;
            if (windSpeedEle != null && windSpeedEle.hasAttribute("mps")) {
                windValue = Double.parseDouble(windSpeedEle.getAttribute("mps"));
            }

            String conditionValue = condEle != null ? condEle.getAttribute("name") : "Unknown";

            WeatherPoint point = new WeatherPoint(tempValue, humidValue, presValue, windValue, conditionValue);

            dailyData.computeIfAbsent(localDate, k -> new ArrayList<>()).add(point);
        }

        List<DailyWeatherData> forecastList = new ArrayList<>();

        // Take up to 5 days from the forecast
        int count = 0;
        for (Map.Entry<LocalDate, List<WeatherPoint>> entry : dailyData.entrySet()) {
            if (count >= 5) break;
            LocalDate date = entry.getKey();
            List<WeatherPoint> points = entry.getValue();

            double minTemp = points.stream().mapToDouble(p -> p.temperature).min().orElse(0);
            double maxTemp = points.stream().mapToDouble(p -> p.temperature).max().orElse(0);
            double avgHumidity = points.stream().mapToInt(p -> p.humidity).average().orElse(0);
            double avgPressure = points.stream().mapToDouble(p -> p.pressure).average().orElse(0);
            double avgWind = points.stream().mapToDouble(p -> p.windSpeed).average().orElse(0);

            String commonCondition = points.stream()
                    .map(p -> p.condition)
                    .reduce((a, b) -> Collections.frequency(points.stream().map(p -> p.condition).toList(), a) >
                            Collections.frequency(points.stream().map(p -> p.condition).toList(), b) ? a : b)
                    .orElse("Unknown");

            forecastList.add(new DailyWeatherData(date.toString(), minTemp, maxTemp, avgHumidity, avgPressure, avgWind, commonCondition));
            count++;
        }

        return forecastList;
    }

    static class WeatherPoint {
        double temperature;
        int humidity;
        double pressure;
        double windSpeed;
        String condition;

        public WeatherPoint(double temperature, int humidity, double pressure, double windSpeed, String condition) {
            this.temperature = temperature;
            this.humidity = humidity;
            this.pressure = pressure;
            this.windSpeed = windSpeed;
            this.condition = condition;
        }
    }

    public static class DailyWeatherData {
        String date;
        double minTemp;
        double maxTemp;
        double avgHumidity;
        double avgPressure;
        double avgWindSpeed;
        String condition;

        public DailyWeatherData(String date, double minTemp, double maxTemp, double avgHumidity, double avgPressure, double avgWindSpeed, String condition) {
            this.date = date;
            this.minTemp = minTemp;
            this.maxTemp = maxTemp;
            this.avgHumidity = avgHumidity;
            this.avgPressure = avgPressure;
            this.avgWindSpeed = avgWindSpeed;
            this.condition = condition;
        }

        public String toJson() {
            return "{"
                    + "\"date\":\"" + date + "\","
                    + "\"minTemp\":\"" + minTemp + "\","
                    + "\"maxTemp\":\"" + maxTemp + "\","
                    + "\"avgHumidity\":\"" + avgHumidity + "\","
                    + "\"avgPressure\":\"" + avgPressure + "\","
                    + "\"avgWindSpeed\":\"" + avgWindSpeed + "\","
                    + "\"condition\":\"" + condition + "\""
                    + "}";
        }
    }
}
