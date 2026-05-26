package com.taskhub.controller;

import com.taskhub.dto.AuthRequest;
import com.taskhub.dto.AuthResponse;
import com.taskhub.dto.RegisterRequest;
import com.taskhub.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest authRequest){
        String token = authService.login(authRequest);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setAccessToken(token);

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest registerRequest){
        String response = authService.register(registerRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email){
        authService.forgotPassword(email);
        return ResponseEntity.ok("Password reset instructions sent to email (placeholder)");
    }

    @GetMapping("/me")
    public ResponseEntity<java.util.Map<String, Object>> getCurrentUser(
            org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUser(authentication.getName()));
    }
}
