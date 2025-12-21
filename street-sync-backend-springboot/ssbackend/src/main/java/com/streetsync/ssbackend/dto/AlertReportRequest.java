package com.streetsync.ssbackend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.streetsync.ssbackend.constants.AlertCategory;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AlertReportRequest(
        AlertCategory category,
        String subCategory,
        double lat,
        double lng,
        String userId
) {}
