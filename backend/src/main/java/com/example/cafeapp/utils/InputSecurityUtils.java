package com.example.cafeapp.utils;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

public final class InputSecurityUtils {
    private static final long MAX_IMAGE_SIZE_BYTES = 2L * 1024L * 1024L;

    private static final Map<String, String> CONTENT_TYPE_TO_EXTENSION = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");

    private InputSecurityUtils() {
    }

    public static String createSafeImageFileName(MultipartFile image) throws IOException {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Image is empty");
        }

        if (image.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new IllegalArgumentException("Image size must not exceed 2 MB");
        }

        String contentType = image.getContentType() == null
                ? ""
                : image.getContentType().toLowerCase(Locale.ROOT);
        String extension = CONTENT_TYPE_TO_EXTENSION.get(contentType);
        if (extension == null) {
            throw new IllegalArgumentException("Unsupported image content type");
        }

        String originalExtension = getExtension(image.getOriginalFilename());
        if (!originalExtension.isBlank() && !ALLOWED_EXTENSIONS.contains(originalExtension)) {
            throw new IllegalArgumentException("Unsupported image extension");
        }

        if (!hasExpectedMagicBytes(image, contentType)) {
            throw new IllegalArgumentException("Uploaded file content does not match image type");
        }

        return UUID.randomUUID() + extension;
    }

    public static Path resolveUploadTarget(Path uploadDirectory, String fileName) {
        Path normalizedUploadDirectory = uploadDirectory.toAbsolutePath().normalize();
        Path target = normalizedUploadDirectory.resolve(fileName).normalize();

        if (!target.startsWith(normalizedUploadDirectory)) {
            throw new IllegalArgumentException("Invalid upload target");
        }

        return target;
    }

    public static String toUploadUrl(String fileName) {
        return "/uploads/" + fileName;
    }

    public static String normalizeUploadUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return null;
        }

        String normalized = imageUrl.trim();
        if (!normalized.matches("^/uploads/[A-Za-z0-9._-]{1,160}\\.(?i:jpg|jpeg|png|webp)$")) {
            throw new IllegalArgumentException("Image URL must point to a local uploaded image");
        }

        return normalized;
    }

    private static String getExtension(String filename) {
        if (filename == null || filename.isBlank()) {
            return "";
        }

        String normalized = filename.toLowerCase(Locale.ROOT);
        int lastDot = normalized.lastIndexOf('.');
        if (lastDot < 0 || lastDot == normalized.length() - 1) {
            return "";
        }

        return normalized.substring(lastDot);
    }

    private static boolean hasExpectedMagicBytes(MultipartFile image, String contentType) throws IOException {
        byte[] header = image.getInputStream().readNBytes(12);

        return switch (contentType) {
            case "image/jpeg" -> header.length >= 3
                    && (header[0] & 0xFF) == 0xFF
                    && (header[1] & 0xFF) == 0xD8
                    && (header[2] & 0xFF) == 0xFF;
            case "image/png" -> header.length >= 8
                    && (header[0] & 0xFF) == 0x89
                    && header[1] == 0x50
                    && header[2] == 0x4E
                    && header[3] == 0x47
                    && header[4] == 0x0D
                    && header[5] == 0x0A
                    && header[6] == 0x1A
                    && header[7] == 0x0A;
            case "image/webp" -> header.length >= 12
                    && header[0] == 0x52
                    && header[1] == 0x49
                    && header[2] == 0x46
                    && header[3] == 0x46
                    && header[8] == 0x57
                    && header[9] == 0x45
                    && header[10] == 0x42
                    && header[11] == 0x50;
            default -> false;
        };
    }
}
