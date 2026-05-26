package com.taskhub.service;

import com.taskhub.dto.AuthRequest;
import com.taskhub.dto.RegisterRequest;
import java.util.Map;

public interface AuthService {
    String login(AuthRequest authRequest);
    String register(RegisterRequest registerRequest);
    void forgotPassword(String email);
    Map<String, Object> getCurrentUser(String email);
}
