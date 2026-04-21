package com.example.cafeapp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CafeRegisterRequest {
    private String cafeName;
    private String ownerName;
    private String email;
    private String password;
}
