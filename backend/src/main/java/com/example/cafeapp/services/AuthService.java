package com.example.cafeapp.services;

import com.example.cafeapp.entities.Cafe;
import com.example.cafeapp.entities.User;
import com.example.cafeapp.entities.UserRole;
import com.example.cafeapp.repositories.CafeRepository;
import com.example.cafeapp.repositories.UserRepository;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Autowired
    private CafeRepository cafeRepository;

    public Optional<User> register(
            @NotBlank String name,
            @Email String email,
            @Size(min = 6) String password,
            UserRole role
    ) {
        if (userRepository.existsByEmail(email)) {
            logger.warn("Registration attempt with already used email: {}", email);
            return Optional.empty();
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);

        User saved = userRepository.save(user);
        logger.info("New user registered {} with role {}", saved.getEmail(), role);
        return Optional.of(saved);
    }

    public Optional<User> login(String email, String rawPassword) {
        return userRepository.findByEmail(email)
                .filter(user -> {
                    boolean match = passwordEncoder.matches(rawPassword, user.getPassword());
                    if (!match) {
                        logger.warn("Invalid password for email: {}", email);
                    }
                    return match;
                });
    }

    public Optional<User> loginWithRole(String email, String rawPassword, UserRole requiredRole) {
        return login(email, rawPassword)
                .filter(user -> {
                    boolean valid = user.getRole() == requiredRole;
                    if (!valid) {
                        logger.warn("Login violation: email={} tried to log in as {}, but role is {}",
                                email, requiredRole, user.getRole());
                    }
                    return valid;
                });
    }

    public Optional<Cafe> registerCafe(String cafeName, String ownerName, String email, String password) {
        // First register a user with CAFE role
        if (userRepository.existsByEmail(email)) {
            logger.warn("Cafe with email {} already exists", email);
            return Optional.empty();
        }

        User user = new User();
        user.setName(ownerName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(UserRole.CAFE);

        // Save user to generate an ID
        User savedUser = userRepository.save(user);

        // Create cafe and link it with the user
        Cafe cafe = new Cafe();
        cafe.setName(cafeName);
        cafe.setUser(savedUser); // establish relation here
        // cafe.setEmail(email);

        // Save cafe into the database
        Cafe savedCafe = cafeRepository.save(cafe);

        logger.info("Cafe '{}' registered with user {}", cafeName, email);

        return Optional.of(savedCafe);
    }

    public Optional<Cafe> findCafeByUserId(Long userId) {
        return cafeRepository.findByUserId(userId);
    }
}
