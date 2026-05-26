package com.taskhub.service;

import com.taskhub.dto.AuthRequest;
import com.taskhub.dto.RegisterRequest;
import com.taskhub.entity.User;
import com.taskhub.entity.Invitation;
import com.taskhub.exception.APIException;
import com.taskhub.repository.UserRepository;
import com.taskhub.repository.InvitationRepository;
import com.taskhub.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private AuthenticationManager authenticationManager;
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtTokenProvider jwtTokenProvider;
    private InvitationService invitationService;
    private InvitationRepository invitationRepository;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider jwtTokenProvider,
                           InvitationService invitationService,
                           InvitationRepository invitationRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.invitationService = invitationService;
        this.invitationRepository = invitationRepository;
    }

    @Override
    public String login(AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authRequest.getEmail(),
                        authRequest.getPassword()
                )
            );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        return jwtTokenProvider.generateToken(authentication);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public String register(RegisterRequest registerRequest) {
        String email = registerRequest.getEmail().trim().toLowerCase();

        java.util.Optional<User> existingUserOpt = userRepository.findByEmail(email);
        User user;
        if (existingUserOpt.isPresent()) {
            boolean hasPendingInvitation = !invitationRepository.findByEmailIgnoreCaseAndStatus(
                    email, Invitation.InvitationStatus.PENDING).isEmpty();
            if (hasPendingInvitation) {
                user = existingUserOpt.get();
                user.setName(registerRequest.getName());
                user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            } else {
                throw new APIException(HttpStatus.BAD_REQUEST, "Email is already exists!");
            }
        } else {
            user = new User();
            user.setName(registerRequest.getName());
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        }

        userRepository.save(user);

        // Auto-accept any pending workspace invitations for this registered email
        try {
            invitationService.autoAcceptPendingInvitations(email);
        } catch (Exception e) {
            System.err.println("Auto-accept invitation exception: " + e.getMessage());
        }

        return "User registered successfully!.";
    }

    @Override
    public void forgotPassword(String email) {
        // Placeholder for forgot password logic
        if(!userRepository.existsByEmail(email)) {
            throw new APIException(HttpStatus.NOT_FOUND, "User not found with email: " + email);
        }
        
        // Generate reset token, save to DB, send email
        System.out.println("Forgot password requested for email: " + email);
    }

    @Override
    public java.util.Map<String, Object> getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "User not found"));
        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("id", user.getId());
        result.put("name", user.getName());
        result.put("email", user.getEmail());
        return result;
    }
}
