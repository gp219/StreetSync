package com.streetsync.ssbackend.repository;

import com.streetsync.ssbackend.model.Alert;
import org.springframework.data.geo.Circle;
import org.springframework.data.geo.Distance;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends MongoRepository<Alert, String> {
    List<Alert> findByCategoryAndLocationNear(String category, GeoJsonPoint location, Distance distance);
    List<Alert> findByStatusAndLocationNear(String status, GeoJsonPoint location, Distance distance);
    List<Alert> findByStatusAndLocationWithinAndExpireAtAfter(
            String status,
            Circle circle,
            LocalDateTime time
    );
    List<Alert> findByStatusAndLocationNearAndExpireAtAfter(String status, GeoJsonPoint point, Distance distance, LocalDateTime time);
}
