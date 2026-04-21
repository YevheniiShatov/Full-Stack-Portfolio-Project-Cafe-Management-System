package com.example.cafeapp.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.locationtech.jts.geom.Polygon;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
public class District {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Имя района/зоны
    @Column(nullable = false)
    private String name;

    // Для районов из OSM — внешний идентификатор, для кастомных зон можно оставить null


    // Геометрия района/зоны
    @Column(nullable = false, columnDefinition = "POLYGON SRID 4326")

    private Polygon boundary;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cafe_id")
    private Cafe cafe;

    @Column(precision = 12, scale = 2)
    private BigDecimal deliveryPrice;
}
