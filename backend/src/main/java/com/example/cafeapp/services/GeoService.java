package com.example.cafeapp.services;

import com.example.cafeapp.dto.NominatimResponse;
import com.example.cafeapp.entities.Cafe;
import com.example.cafeapp.repositories.DistrictRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Setter;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@Setter
public class GeoService {

    private record GeoQueryResult(Optional<Coordinate> coord, NominatimResponse[] rawResults) {}

    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private final GeometryFactory geometryFactory = new GeometryFactory();

    private static final Logger log = LoggerFactory.getLogger(GeoService.class);

    public Optional<Coordinate> getCoordinatesByAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            log.warn("GeoService → empty address for geocoding");
            return Optional.empty();
        }

        String original   = address.trim();
        String normalized = normalizeAddress(original);
        String simplified = simplifyAddress(normalized);

        for (String variant : new String[]{original, normalized, simplified}) {
            log.info("GeoService → trying address variant: {}", variant);
            GeoQueryResult result = queryNominatim(variant);

            if (result.coord().isPresent()) {
                log.info("GeoService → coordinate found from variant '{}': {}", variant, result.coord().get());
                return result.coord();
            }

            if (result.rawResults().length > 0) {
                log.warn("GeoService → variant '{}' returned {} result(s), but no valid coordinate extracted", variant, result.rawResults().length);
                for (int i = 0; i < result.rawResults().length; i++) {
                    NominatimResponse r = result.rawResults()[i];
                    log.warn(
                            "→ Rejected Result #{}: lat={}, lon={}, category={}, type={}, class={}, addressType={}, displayName={}",
                            i + 1,
                            r.getLat(),
                            r.getLon(),
                            r.getCategory(),
                            r.getType(),
                            r.getClazz(),
                            r.getAddressType(),
                            r.getDisplayName()
                    );
                }
            }
        }

        log.warn("GeoService → all address variants failed: {}", address);
        return Optional.empty();
    }

        private GeoQueryResult queryNominatim(String query) {
        String baseUrl = "https://nominatim.openstreetmap.org/search"
                + "?q={address}&format=jsonv2&limit=10&accept-language=sk&countrycodes=sk";

        Map<String, String> uriParams = Map.of("address", query);

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "CafeApp/1.0 (contact: nearu31@gmail.com)");
        headers.set("Accept", "application/json");

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        log.info("GeoService → sending request to Nominatim: {} with address='{}'", baseUrl, query);

        try {
            ResponseEntity<NominatimResponse[]> response = restTemplate.exchange(
                    baseUrl,
                    HttpMethod.GET,
                    entity,
                    NominatimResponse[].class,
                    uriParams
            );

            if (response.hasBody()) {
                try {
                    log.warn("GeoService → RAW JSON RESPONSE: {}", objectMapper.writeValueAsString(response.getBody()));
                } catch (Exception ex) {
                    log.warn("GeoService → failed to log JSON: {}", ex.getMessage());
                }
            }

            NominatimResponse[] results = response.getBody();
            if (results == null || results.length == 0) {
                log.warn("GeoService → Nominatim response is empty for query '{}'", query);
                return new GeoQueryResult(Optional.empty(), new NominatimResponse[0]);
            }

            for (NominatimResponse r : results) {
                Optional<Coordinate> coord = parseCoordinate(r);
                if ("building".equalsIgnoreCase(r.getCategory()) && coord.isPresent()) {
                    return new GeoQueryResult(coord, results);
                }
            }

            for (NominatimResponse r : results) {
                Optional<Coordinate> coord = parseCoordinate(r);
                if (coord.isPresent()) {
                    return new GeoQueryResult(coord, results);
                }
            }

            return new GeoQueryResult(Optional.empty(), results);

        } catch (Exception e) {
            log.error("GeoService → error while querying Nominatim. query='{}', error={}", query, e.getMessage(), e);
            return new GeoQueryResult(Optional.empty(), new NominatimResponse[0]);
        }
    }


    private Optional<Coordinate> parseCoordinate(NominatimResponse r) {
        try {
            double lon = Double.parseDouble(r.getLon());
            double lat = Double.parseDouble(r.getLat());
            return Optional.of(new Coordinate(lon, lat));
        } catch (NumberFormatException e) {
            log.warn("GeoService → invalid coordinates: lat={}, lon={}", r.getLat(), r.getLon());
            return Optional.empty();
        }
    }

    public List<Cafe> findCafesByLocation(double lon, double lat) {
        List<Cafe> cafes = districtRepository.findCafesByCoordinates(lon, lat);

        Map<Long, Cafe> unique = new LinkedHashMap<>();
        for (Cafe cafe : cafes) {
            unique.putIfAbsent(cafe.getId(), cafe);
        }
        return new ArrayList<>(unique.values());
    }

    private String normalizeAddress(String address) {
        return address
                .replaceAll("[/\\\\]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String simplifyAddress(String address) {
        return address
                .replaceAll("[/\\\\]", " ")
                .replaceAll("\\b(\\d+)\\s+\\d+\\b", "$1")  // 8215 1 → 8215
                .replaceAll("\\s+", " ")
                .trim();
    }
}
