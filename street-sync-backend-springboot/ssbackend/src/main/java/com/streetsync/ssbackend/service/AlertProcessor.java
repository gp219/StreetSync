package com.streetsync.ssbackend.service;

import com.streetsync.ssbackend.dto.AlertReportRequest;
import com.streetsync.ssbackend.model.Alert;
import com.streetsync.ssbackend.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.geo.Circle;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AlertProcessor {

    private final AlertRepository alertRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "city-reports", groupId = "street-sync-group")
    public void processReport(AlertReportRequest payload) { // Use DTO instead of Map
        System.out.println("Kafka Received Typed Report: " + payload);

        // No more manual parsing! Get data directly from DTO
        double lat = payload.lat();
        double lng = payload.lng();
        String categoryStr = payload.category().name(); // Get Enum name as String for DB query

        // 1. Spatial Query: Find similar reports within 100 meters
        GeoJsonPoint currentPoint = new GeoJsonPoint(lng, lat);
        Distance radius = new Distance(0.1, Metrics.KILOMETERS); // 100m

        List<Alert> existing = alertRepository.findByCategoryAndLocationNear(categoryStr, currentPoint, radius);

        if (existing.isEmpty()) {
            // New Report
            Alert newAlert = Alert.builder()
                    .category(categoryStr)
                    .subCategory(payload.subCategory())
                    .location(currentPoint)
                    .verificationCount(1)
                    .status("PENDING")
                    .userId(payload.userId()) // Store who reported it
                    .createdAt(LocalDateTime.now())
                    // Set expiry to 30 mins from now
                    .expireAt(LocalDateTime.now().plusMinutes(30))
                    .build();
            alertRepository.save(newAlert);
        } else {
            // Increment existing
            Alert alert = existing.get(0);
            alert.setVerificationCount(alert.getVerificationCount() + 1);

            // Logic: Once it hits 3 reports, it becomes "Validated" and is pushed to Map
            if (alert.getVerificationCount() >= 3 && !alert.getStatus().equals("VALIDATED")) {
                alert.setStatus("VALIDATED");
                // 2. Real-time Push via WebSockets to all connected clients
                messagingTemplate.convertAndSend("/topic/nearby-alerts", alert);
            }
            alertRepository.save(alert);
        }
    }

    public List<Alert> getNearbyValidatedAlerts(double lat, double lng, double radiusKm) {
        GeoJsonPoint searchPoint = new GeoJsonPoint(lng, lat);
        Distance distance = new Distance(radiusKm, Metrics.KILOMETERS);

        return alertRepository.findByStatusAndLocationNear(
                "VALIDATED",
                searchPoint,
                distance
        );
    }
}
