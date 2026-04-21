package com.example.cafeapp.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderResponse {
    private Long id;
    private String status;
    private String clientName;
    private String clientPhone;
    private String clientEmail;
    private String address;

    private List<OrderMenuItemResponse> items;


    public OrderResponse(Long id, String status, String clientName, String clientPhone, String clientEmail,String address, List<OrderMenuItemResponse> items) {
        this.id = id;
        this.status = status;
        this.clientName = clientName;
        this.clientPhone = clientPhone;
        this.clientEmail = clientEmail;
        this.address = address;
        this.items = items;
    }

}
