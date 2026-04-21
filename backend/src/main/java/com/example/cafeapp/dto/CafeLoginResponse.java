package com.example.cafeapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class
CafeLoginResponse {
    private UserDto user;
    private String token;
    private Long cafeId;
}
