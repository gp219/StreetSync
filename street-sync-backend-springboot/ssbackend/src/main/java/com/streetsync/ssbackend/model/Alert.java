package com.streetsync.ssbackend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "alerts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alert {
    @Id
    private String id;
    private String userId;
    private String category;    // ROAD_HAZARD, TRANSPORT_DELAY, etc.
    private String subCategory; // POTHOLE, BUS_STOPPED, etc.

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location; // Changed from double[] to GeoJsonPoint

    private int verificationCount;
    private String status; // PENDING, VALIDATED

    private LocalDateTime createdAt;

    @Indexed(expireAfter = "0s") // TTL Index for auto-cleanup
    private LocalDateTime expireAt;
}
