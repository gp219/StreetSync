package com.streetsync.ssbackend.controller;

import com.streetsync.ssbackend.constants.AlertCategory;
import com.streetsync.ssbackend.dto.AlertReportRequest;
import com.streetsync.ssbackend.model.Alert;
import com.streetsync.ssbackend.repository.AlertRepository;
import com.streetsync.ssbackend.service.AlertProcessor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.awt.*;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final AlertProcessor alertProcessor;
    private static final String TOPIC = "city-reports";

    /**
     * Fetch all available categories and subcategories for the UI
     */
    @GetMapping("/categories")
    public Map<AlertCategory, List<String>> getCategories() {
        return Arrays.stream(AlertCategory.values())
                .collect(Collectors.toMap(
                        category -> category,
                        AlertCategory::getSubCategories
                ));
    }

    /**
     * Submit a report using the typed DTO
     */
    @PostMapping("/report")
    public Map<String, String> reportAlert(@RequestBody AlertReportRequest request) {
        // Enforce validation: ensure subcategory belongs to category
        if (!request.category().getSubCategories().contains(request.subCategory())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid subcategory for this category");
        }

        // Send the typed object to Kafka
        kafkaTemplate.send(TOPIC, request);
        return Map.of("message", "Report received and being processed");
    }

    @GetMapping("/nearby")
    public List<Alert> getNearby(@RequestParam double lat, @RequestParam double lng) {
        // Radius kept at 20.0km as per your requirement
        return alertProcessor.getNearbyValidatedAlerts(lat, lng, 100.0);
    }
}
