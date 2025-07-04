package com.example.mediasphere_initial.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class ImageUploadService {

    @Value("${app.upload.dir:uploads/thread-images}")
    private String uploadDir;

    @Value("${app.upload.max-size:10485760}") // 10MB default
    private long maxFileSize;

    private static final String[] ALLOWED_EXTENSIONS = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

    public String uploadImage(MultipartFile file, UUID threadId) throws IOException {
        System.out.println("=== DEBUG: ImageUploadService.uploadImage ===");
        System.out.println("File name: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize());
        System.out.println("Thread ID: " + threadId);
        System.out.println("Upload directory: " + uploadDir);

        // Validate file
        System.out.println("Validating file...");
        validateFile(file);
        System.out.println("File validation passed");

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        System.out.println("Upload path: " + uploadPath.toAbsolutePath());
        if (!Files.exists(uploadPath)) {
            System.out.println("Creating upload directory...");
            Files.createDirectories(uploadPath);
            System.out.println("Upload directory created");
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueFilename = String.format("thread_%s_%s_%s%s",
                threadId.toString(), timestamp, UUID.randomUUID().toString().substring(0, 8), extension);
        System.out.println("Generated filename: " + uniqueFilename);

        // Save file
        Path filePath = uploadPath.resolve(uniqueFilename);
        System.out.println("Saving file to: " + filePath.toAbsolutePath());
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("File saved successfully");

        // Return relative path for database storage
        String relativePath = "uploads/thread-images/" + uniqueFilename;
        System.out.println("Returning relative path: " + relativePath);
        return relativePath;
    }

    private void validateFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("File is empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new IOException("File size exceeds maximum limit of " + (maxFileSize / 1024 / 1024) + "MB");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            throw new IOException("Invalid filename");
        }

        String extension = getFileExtension(filename).toLowerCase();
        boolean isValidExtension = false;
        for (String allowedExt : ALLOWED_EXTENSIONS) {
            if (allowedExt.equals(extension)) {
                isValidExtension = true;
                break;
            }
        }

        if (!isValidExtension) {
            throw new IOException("Invalid file type. Allowed types: " + String.join(", ", ALLOWED_EXTENSIONS));
        }

        // Check MIME type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IOException("Invalid file type. Must be an image.");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex == -1 ? "" : filename.substring(lastDotIndex);
    }

    public void deleteImage(String imagePath) {
        try {
            Path path = Paths.get(imagePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            // Log error but don't throw exception
            System.err.println("Failed to delete image: " + imagePath + " - " + e.getMessage());
        }
    }
}
