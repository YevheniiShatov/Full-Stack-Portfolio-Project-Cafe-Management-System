//package com.example.cafeapp.entities;
//
//import jakarta.persistence.*;
//import lombok.Getter;
//import lombok.Setter;
//
//@Entity
//@Getter
//@Setter
//public class DeliveryZone {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private String name;
//    @Column(columnDefinition = "TEXT")
//    private String coordinates;
//
//
//    @ManyToOne
//    @JoinColumn(name = "cafe_id", nullable = false)
//    private Cafe cafe;
//
//
//
//}
