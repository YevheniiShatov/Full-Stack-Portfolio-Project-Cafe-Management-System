package com.example.cafeapp.dto;



import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class DistrictRequest {
    private String name;
    private List<List<Double>> coordinates;
    private BigDecimal deliveryPrice;
}
