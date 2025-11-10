import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.util.List;

public class WeatherServer {
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        System.out.println("🌤️ Weather server started on http://localhost:8080");

        server.createContext("/weather", new WeatherHandler());
        server.setExecutor(null);
        server.start();
    }

    static class WeatherHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            URI requestURI = exchange.getRequestURI();
            String query = requestURI.getQuery();

            if (query == null || !query.startsWith("city=")) {
                sendResponse(exchange, 400, "{\"error\":\"Please provide ?city=CityName\"}");
                return;
            }

            String city = query.split("=")[1];
            try {
                List<WeatherService.DailyWeatherData> forecast = WeatherService.getFiveDayForecast(city);
                StringBuilder jsonBuilder = new StringBuilder();
                jsonBuilder.append("[");
                for (int i = 0; i < forecast.size(); i++) {
                    jsonBuilder.append(forecast.get(i).toJson());
                    if (i != forecast.size() - 1) {
                        jsonBuilder.append(",");
                    }
                }
                jsonBuilder.append("]");
                sendResponse(exchange, 200, jsonBuilder.toString());
            } catch (Exception e) {
                sendResponse(exchange, 500, "{\"error\":\"Failed to fetch weather\"}");
            }
        }

        private void sendResponse(HttpExchange exchange, int code, String response) throws IOException {
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(code, response.getBytes().length);
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }
}
