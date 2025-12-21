package com.streetsync.ssbackend.constants;

import java.util.Arrays;
import java.util.List;

public enum AlertCategory {
    ROAD_HAZARD(Arrays.asList("POTHOLE", "STREET_LIGHT_DOWN", "SINKHOLE")),
    TRANSPORT_DELAY(Arrays.asList("TRAFFIC_JAM", "BUS_DELAY", "ACCIDENT")),
    WEATHER_IMPACT(Arrays.asList("FLOODING", "FALLEN_TREE"));

    private final List<String> subCategories;

    AlertCategory(List<String> subCategories) {
        this.subCategories = subCategories;
    }

    public List<String> getSubCategories() {
        return subCategories;
    }
}
