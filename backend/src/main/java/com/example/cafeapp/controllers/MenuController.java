package com.example.cafeapp.controllers;

import com.example.cafeapp.dto.MenuItemCreateRequest;
import com.example.cafeapp.dto.MenuItemResponse;
import com.example.cafeapp.entities.MenuItem;
import com.example.cafeapp.services.MenuService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<?> getMenuItems(
            @RequestParam(value = "cafe", required = false) Long cafeId
    ) {
        if (cafeId != null) {
            return ResponseEntity.ok(menuService.getMenuItemsByCafe(cafeId));
        } else {
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/{cafeId}")
    public ResponseEntity<?> getMenuItemsByPath(@PathVariable Long cafeId) {
        List<MenuItem> items = menuService.getMenuItemsByCafe(cafeId);

        List<MenuItemResponse> response = items.stream()
                .map(item -> new MenuItemResponse(
                        item.getId(),
                        item.getName(),
                        item.getPrice(),
                        item.getDescription(),
                        item.getImageUrl()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/{cafeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addMenuItem(
            @PathVariable Long cafeId,
            @RequestPart("meta") String metaJson,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        try {
            MenuItemCreateRequest meta = objectMapper.readValue(metaJson, MenuItemCreateRequest.class);

            if (meta.getName() == null || meta.getName().isBlank() || meta.getPrice() == null) {
                return ResponseEntity.badRequest().body("Name and price are required");
            }

            String imageUrl = null;
            if (image != null && !image.isEmpty()) {
                String fileName = UUID.randomUUID() + "_" + Paths.get(image.getOriginalFilename()).getFileName();
                Path uploadPath = Paths.get("uploads");
                Files.createDirectories(uploadPath);
                Files.copy(image.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
                imageUrl = "/uploads/" + fileName;
            }

            MenuItem menuItem = new MenuItem();
            menuItem.setName(meta.getName());
            menuItem.setPrice(meta.getPrice());
            menuItem.setDescription(meta.getDescription());
            menuItem.setImageUrl(imageUrl);

            return ResponseEntity.ok(menuService.addMenuItem(cafeId, menuItem));

        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            return ResponseEntity.badRequest().body("Invalid meta JSON format: " + e.getOriginalMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
