package com.example.cafeapp.controllers;

import com.example.cafeapp.dto.*;
import com.example.cafeapp.entities.Cafe;
import com.example.cafeapp.entities.User;
import com.example.cafeapp.entities.UserRole;
import com.example.cafeapp.services.AuthService;
import com.example.cafeapp.utils.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody RegisterRequest request) {
        Optional<User> registeredUser = authService.register(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                UserRole.USER
        );
        return registeredUser.map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    @PostMapping("/register-courier")
    public ResponseEntity<User> registerCourier(@RequestBody RegisterRequest request) {
        Optional<User> registeredUser = authService.register(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                UserRole.COURIER
        );
        return registeredUser.map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> loginUser(@RequestBody LoginRequest loginRequest) {
        Optional<User> user = authService.login(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        return user.map(u -> {
            String token = jwtUtils.generateJwtToken(u);
            UserDto userDto = new UserDto(
                    u.getId(),
                    u.getName(),
                    u.getEmail(),
                    u.getRole().name()
            );
            return ResponseEntity.ok(new JwtResponse(userDto, token));
        }).orElse(ResponseEntity.status(401).build());
    }

    @PostMapping("/login-courier")
    public ResponseEntity<JwtResponse> loginCourier(@RequestBody LoginRequest loginRequest) {
        logger.info("Courier login request with email: {}", loginRequest.getEmail());

        Optional<User> user = authService.loginWithRole(
                loginRequest.getEmail(),
                loginRequest.getPassword(),
                UserRole.COURIER
        );

        return user.map(u -> {
            logger.info("Courier login successful: {}", u.getEmail());
            String token = jwtUtils.generateJwtToken(u);
            UserDto userDto = new UserDto(
                    u.getId(),
                    u.getName(),
                    u.getEmail(),
                    u.getRole().name()
            );
            return ResponseEntity.ok(new JwtResponse(userDto, token));
        }).orElseGet(() -> {
            logger.warn("Courier login failed with email: {}", loginRequest.getEmail());
            return ResponseEntity.status(403).build();
        });
    }

    @PostMapping("/register-cafe")
    public ResponseEntity<Cafe> registerCafe(@RequestBody CafeRegisterRequest request) {
        return authService.registerCafe(
                        request.getCafeName(),
                        request.getOwnerName(),
                        request.getEmail(),
                        request.getPassword()
                ).map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    @PostMapping("/login-cafe")
    public ResponseEntity<?> loginCafe(@RequestBody LoginRequest loginRequest) {
        logger.info("Cafe login request with email: {}", loginRequest.getEmail());

        Optional<User> user = authService.loginWithRole(
                loginRequest.getEmail(),
                loginRequest.getPassword(),
                UserRole.CAFE
        );

        return user.map(u -> {
            logger.info("Cafe login successful: {}", u.getEmail());
            String token = jwtUtils.generateJwtToken(u);

            Optional<Cafe> cafeOpt = authService.findCafeByUserId(u.getId());
            if (cafeOpt.isEmpty()) {
                logger.warn("Cafe not found for user {}", u.getEmail());
                return ResponseEntity.status(404).body("Cafe not found");
            }

            Cafe cafe = cafeOpt.get();

            UserDto userDto = new UserDto(
                    u.getId(),
                    u.getName(),
                    u.getEmail(),
                    u.getRole().name()
            );

            return ResponseEntity.ok(
                    new CafeLoginResponse(userDto, token, cafe.getId())
            );
        }).orElseGet(() -> {
            logger.warn("Cafe login failed with email: {}", loginRequest.getEmail());
            return ResponseEntity.status(403).build();
        });
    }
}
