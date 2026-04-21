// src/main/java/com/example/cafeapp/dto/OrderRequest.java
package com.example.cafeapp.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;



@Getter
@Setter
public class OrderRequest {
    private List<MenuItemRequest> items;
    private String cafe;
    private double latitude;
    private double longitude;
    private String address;
    private String clientName;
    private String clientPhone;
    private String clientEmail;

}