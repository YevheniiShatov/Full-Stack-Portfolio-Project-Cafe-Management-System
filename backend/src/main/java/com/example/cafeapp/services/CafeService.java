package com.example.cafeapp.services;

import com.example.cafeapp.entities.District;
import com.example.cafeapp.repositories.DistrictRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CafeService {

    @Autowired
    private DistrictRepository districtRepository;

    private GeometryFactory geometryFactory = new GeometryFactory();

    public String getCafeByLocation(double latitude, double longitude) {
        Coordinate userLocation = new Coordinate(latitude, longitude);


        Optional<District> district = districtRepository.findAll().stream()
                .filter(d -> d.getBoundary().contains(geometryFactory.createPoint(userLocation)))
                .findFirst();

        return district.map(District::getName).orElse("Unknown");
    }
}
