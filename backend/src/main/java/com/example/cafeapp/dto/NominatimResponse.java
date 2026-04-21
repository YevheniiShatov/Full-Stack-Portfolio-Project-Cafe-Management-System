package com.example.cafeapp.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class NominatimResponse {
    private String lat;
    private String lon;

    private String category;
    private String type;

    @JsonProperty("display_name")
    private String displayName;

    @JsonProperty("class")
    private String clazz;

    @JsonProperty("addresstype")
    private String addressType;
}
