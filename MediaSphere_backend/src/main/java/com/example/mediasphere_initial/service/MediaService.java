package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.Media;
import com.example.mediasphere_initial.repository.MediaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MediaService {

    @Autowired
    private MediaRepository mediaRepository;

    public List<Media> getAllMedia() {
        return mediaRepository.findAll();
    }

    public Optional<Media> getMediaById(UUID id) {
        return mediaRepository.findById(id);
    }

    public Media createMedia(Media media) {
        media.setId(UUID.randomUUID());
        media.setCreatedAt(LocalDateTime.now());
        return mediaRepository.save(media);
    }

    public boolean deleteMedia(UUID id) {
        if (mediaRepository.existsById(id)) {
            mediaRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Media> searchMedia(String keyword) {
        return mediaRepository.searchByTitleOrDescription(keyword);
    }
}
