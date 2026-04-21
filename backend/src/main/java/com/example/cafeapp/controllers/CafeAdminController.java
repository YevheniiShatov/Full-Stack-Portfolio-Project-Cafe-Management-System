package com.example.cafeapp.controllers;

import com.example.cafeapp.dto.DistrictRequest;
import com.example.cafeapp.dto.MenuItemResponse;
import com.example.cafeapp.entities.Cafe;
import com.example.cafeapp.entities.District;
import com.example.cafeapp.entities.MenuItem;

import com.example.cafeapp.repositories.CafeRepository;
import com.example.cafeapp.repositories.DistrictRepository;
import com.example.cafeapp.repositories.MenuItemRepository;
//import com.example.cafeapp.repositories.DeliveryZoneRepository;

import org.locationtech.jts.geom.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/cafe-admin")
public class CafeAdminController {

    // repositories
    private final CafeRepository cafeRepository;
    private final MenuItemRepository menuItemRepository;
    private final DistrictRepository districtRepository;

    public CafeAdminController(CafeRepository cafeRepository,
                               MenuItemRepository menuItemRepository,
                               //DeliveryZoneRepository deliveryZoneRepository,
                               DistrictRepository districtRepository) {
        this.cafeRepository = cafeRepository;
        this.menuItemRepository = menuItemRepository;
        this.districtRepository = districtRepository;
    }

    // ===== helper function =====
    private Polygon toPolygon(List<List<Double>> latLngs) {
        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);
        Coordinate[] coords = latLngs.stream()
                .map(ll -> new Coordinate(ll.get(1), ll.getFirst())) // (lon, lat)
                .toArray(Coordinate[]::new);
        if (!coords[0].equals2D(coords[coords.length - 1])) {
            coords = Arrays.copyOf(coords, coords.length + 1);
            coords[coords.length - 1] = coords[0];
        }
        return gf.createPolygon(coords);
    }

    // ===== Add a district =====
    @PostMapping("/districts")
    public ResponseEntity<?> addDistrict(@AuthenticationPrincipal UserDetails userDetails,
                                         @RequestBody DistrictRequest request) {
        Cafe cafe = cafeRepository.findByUser_Email(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Cafe not found"));

        District district = new District();
        district.setName(request.getName());
        district.setDeliveryPrice(request.getDeliveryPrice());
        district.setBoundary(toPolygon(request.getCoordinates()));
        district.setCafe(cafe);

        District saved = districtRepository.save(district);

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", saved.getId());
        resp.put("name", saved.getName());
        resp.put("deliveryPrice", saved.getDeliveryPrice());
        resp.put("coordinates", request.getCoordinates());
        return ResponseEntity.ok(resp);
    }


    // ===== Get all districts =====
    @GetMapping("/districts")
    public ResponseEntity<?> getDistricts(@AuthenticationPrincipal UserDetails userDetails) {
       // Cafe cafe = cafeRepository.findByEmail(userDetails.getUsername())
        Cafe cafe = cafeRepository.findByUser_Email(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Cafe not found"));

        List<District> districts = districtRepository.findAll().stream()
                .filter(d -> d.getCafe() != null && d.getCafe().getId().equals(cafe.getId()))
                .toList();

        List<Map<String, Object>> response = new ArrayList<>();
        for (District d : districts) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", d.getId());
            map.put("name", d.getName());
            map.put("deliveryPrice", d.getDeliveryPrice());

            List<List<Double>> coords = new ArrayList<>();
            for (Coordinate c : d.getBoundary().getCoordinates()) {
                coords.add(List.of(c.getY(), c.getX())); // lat, lon
            }
            map.put("coordinates", coords);
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    // ===== Update a district =====
    @PutMapping("/districts/{id}")
    public ResponseEntity<?> updateDistrict(@PathVariable Long id,
                                            @AuthenticationPrincipal UserDetails userDetails,
                                            @RequestBody DistrictRequest request) {
        Cafe cafe = cafeRepository.findByUser_Email(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Cafe not found"));

        District existing = districtRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("District not found"));

        if (existing.getCafe() == null || !existing.getCafe().getId().equals(cafe.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (request.getName() != null) existing.setName(request.getName());
        if (request.getDeliveryPrice() != null) existing.setDeliveryPrice(request.getDeliveryPrice());
        if (request.getCoordinates() != null && !request.getCoordinates().isEmpty()) {
            existing.setBoundary(toPolygon(request.getCoordinates()));
        }

        District saved = districtRepository.save(existing);

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", saved.getId());
        resp.put("name", saved.getName());
        resp.put("deliveryPrice", saved.getDeliveryPrice());
        List<List<Double>> coords = Arrays.stream(saved.getBoundary().getCoordinates())
                .map(c -> List.of(c.getY(), c.getX()))
                .toList();
        resp.put("coordinates", coords);
        return ResponseEntity.ok(resp);
    }


    // ===== Add a new menu item =====
    @PostMapping("/menu")
    public ResponseEntity<MenuItemResponse> addMenuItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody MenuItem item) {

       // Cafe cafe = cafeRepository.findByEmail(userDetails.getUsername())

        Cafe cafe = cafeRepository.findByUser_Email(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Cafe not found"));

        item.setCafe(cafe);
        MenuItem savedItem = menuItemRepository.save(item);

        MenuItemResponse dto = new MenuItemResponse(
                savedItem.getId(),
                savedItem.getName(),
                savedItem.getPrice(),
                savedItem.getDescription(),
                savedItem.getImageUrl()
        );

        return ResponseEntity.ok(dto);
    }

    // ===== Update a menu item =====
    @PutMapping("/menu/{id}")
    public ResponseEntity<MenuItemResponse> updateMenuItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody MenuItem updatedItem) {

        Cafe cafe = cafeRepository.findByUser_Email(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Cafe not found"));

        MenuItem existing = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        if (!existing.getCafe().getId().equals(cafe.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        existing.setName(updatedItem.getName());
        existing.setPrice(updatedItem.getPrice());
        existing.setDescription(updatedItem.getDescription());
        existing.setImageUrl(updatedItem.getImageUrl());

        MenuItem saved = menuItemRepository.save(existing);

        return ResponseEntity.ok(new MenuItemResponse(
                saved.getId(),
                saved.getName(),
                saved.getPrice(),
                saved.getDescription(),
                saved.getImageUrl()
        ));
    }

    // ===== Get all menu items =====
    @GetMapping("/menu")
    public ResponseEntity<List<MenuItemResponse>> getMenuItems(@AuthenticationPrincipal UserDetails userDetails) {
        Cafe cafe = cafeRepository.findByUser_Email(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Cafe not found"));

        List<MenuItem> items = menuItemRepository.findAll().stream()
                .filter(item -> item.getCafe().getId().equals(cafe.getId()))
                .toList();

        List<MenuItemResponse> response = items.stream()
                .map(item -> new MenuItemResponse(
                        item.getId(),
                        item.getName(),
                        item.getPrice(),
                        item.getDescription(),
                        item.getImageUrl()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }


    // ===== Delete a menu item =====
    @DeleteMapping("/menu/{id}")
    public ResponseEntity<Void> deleteMenuItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Cafe cafe = cafeRepository.findByUser_Email(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Cafe not found"));

        MenuItem existing = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        if (!existing.getCafe().getId().equals(cafe.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        menuItemRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }


    // ===== Delete a district =====
    @DeleteMapping("/districts/{id}")
    public ResponseEntity<Void> deleteDistrict(@PathVariable Long id,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        Cafe cafe = cafeRepository.findByUser_Email(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Cafe not found"));

        District existing = districtRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("District not found"));

        if (existing.getCafe() == null || !existing.getCafe().getId().equals(cafe.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        districtRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }

}
