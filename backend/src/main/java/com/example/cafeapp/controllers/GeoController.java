package com.example.cafeapp.controllers;

import com.example.cafeapp.entities.Cafe;
import com.example.cafeapp.repositories.DistrictRepository;
import com.example.cafeapp.services.GeoService;
import org.locationtech.jts.geom.Coordinate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/geo")
@CrossOrigin
public class GeoController {

    private final GeoService geoService;
    private final DistrictRepository districtRepository;
    private static final Logger log = LoggerFactory.getLogger(GeoController.class);

    public GeoController(GeoService geoService, DistrictRepository districtRepository) {
        this.geoService = geoService;
        this.districtRepository = districtRepository;
    }

    @PostMapping(value = "/address", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getCafeByAddress(@RequestBody Map<String, String> payload) {
        String address = payload.get("address");
        if (address == null || address.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Address is required");
        }

        Optional<Coordinate> coordinatesOpt = geoService.getCoordinatesByAddress(address);
        if (coordinatesOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Failed to determine coordinates for the address");
        }

        Coordinate coord = coordinatesOpt.get();
        double lon = coord.x;
        double lat = coord.y;

        log.info("→ Address geocoded: lat={}, lon={}", lat, lon);

        List<Cafe> cafes = geoService.findCafesByLocation(lon, lat);

        if (cafes.isEmpty()) {
            return ResponseEntity.status(404).body("No cafes found for this address");
        }

        // convert list of cafes to DTO/Map for response
        List<Map<String, Object>> response = new ArrayList<>();
        for (Cafe cafe : cafes) {
            Map<String, Object> cafeMap = new HashMap<>();
            cafeMap.put("id", cafe.getId());
            cafeMap.put("name", cafe.getName());
            cafeMap.put("ownerEmail", cafe.getUser().getEmail());
            response.add(cafeMap);
        }

        return ResponseEntity.ok(response);
    }
}
