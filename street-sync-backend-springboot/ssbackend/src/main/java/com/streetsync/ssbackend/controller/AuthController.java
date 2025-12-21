package com.streetsync.ssbackend.controller;

import com.streetsync.ssbackend.dto.LoginRequest;
import com.streetsync.ssbackend.dto.SignupRequest;
import com.streetsync.ssbackend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String token = authService.login(request);
        // Returning as a Map so it's a proper JSON object { "token": "..." }
        return ResponseEntity.ok(Map.of("token", token));
    }
}
