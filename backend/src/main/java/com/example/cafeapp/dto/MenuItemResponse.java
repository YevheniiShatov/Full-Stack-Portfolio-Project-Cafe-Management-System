package com.example.cafeapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MenuItemResponse {
    private Long id;
    private String name;
    private double price;
    private String description;
    private String imageUrl;
}
