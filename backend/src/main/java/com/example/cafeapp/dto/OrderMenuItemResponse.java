package com.example.cafeapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class OrderMenuItemResponse {

    private String name;
    private double price;
    private int quantity;
}