package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.Media;
import com.example.mediasphere_initial.model.MediaType;
import com.example.mediasphere_initial.repository.MediaRepository;
import com.example.mediasphere_initial.repository.MediaTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
public class MediaService {

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private MediaTypeRepository mediaTypeRepository;

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

    public List<Media> getMediaByMediaTypeId(UUID mediaTypeId) {
        Optional<MediaType> mediaTypeOpt = mediaTypeRepository.findById(mediaTypeId);
        if (!mediaTypeOpt.isPresent()) {
            throw new RuntimeException("Media type not found");
        }
        return mediaRepository.findByMediaType(mediaTypeOpt.get());
    }
    
    // Advanced search with filters and sorting - simplified approach
    public List<Media> searchMediaWithFilters(String keyword, UUID mediaTypeId, String genre, 
                                             String author, Integer releaseYear, String sortBy) {
        
        // Start with all media
        List<Media> results = mediaRepository.findAll();
        
        // Apply filters using Java stream operations
        results = results.stream()
            .filter(media -> {
                // Keyword filter
                if (keyword != null && !keyword.trim().isEmpty()) {
                    String lowerKeyword = keyword.toLowerCase();
                    boolean titleMatch = media.getTitle() != null && media.getTitle().toLowerCase().contains(lowerKeyword);
                    boolean descMatch = media.getDescription() != null && media.getDescription().toLowerCase().contains(lowerKeyword);
                    if (!titleMatch && !descMatch) {
                        return false;
                    }
                }
                
                // Media type filter
                if (mediaTypeId != null) {
                    if (media.getMediaType() == null || !media.getMediaType().getId().equals(mediaTypeId)) {
                        return false;
                    }
                }
                
                // Genre filter
                if (genre != null && !genre.trim().isEmpty()) {
                    if (media.getGenre() == null || !media.getGenre().toLowerCase().contains(genre.toLowerCase())) {
                        return false;
                    }
                }
                
                // Author filter
                if (author != null && !author.trim().isEmpty()) {
                    if (media.getAuthor() == null || !media.getAuthor().toLowerCase().contains(author.toLowerCase())) {
                        return false;
                    }
                }
                
                // Release year filter
                if (releaseYear != null) {
                    if (media.getReleaseYear() == null || !media.getReleaseYear().equals(releaseYear)) {
                        return false;
                    }
                }
                
                return true;
            })
            .collect(Collectors.toList());
        
        // Apply sorting
        return sortMedia(results, sortBy);
    }
    
    // Sort media based on sortBy parameter
    private List<Media> sortMedia(List<Media> mediaList, String sortBy) {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            sortBy = "newest"; // default sorting
        }
        
        return mediaList.stream()
            .sorted(getComparator(sortBy))
            .collect(Collectors.toList());
    }
    
    private Comparator<Media> getComparator(String sortBy) {
        switch (sortBy.toLowerCase()) {
            case "newest":
                return Comparator.comparing(Media::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
            case "oldest":
                return Comparator.comparing(Media::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()));
            case "title":
                return Comparator.comparing(Media::getTitle, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            case "title_desc":
                return Comparator.comparing(Media::getTitle, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER.reversed()));
            case "release_year":
                return Comparator.comparing(Media::getReleaseYear, Comparator.nullsLast(Comparator.reverseOrder()));
            case "release_year_asc":
                return Comparator.comparing(Media::getReleaseYear, Comparator.nullsLast(Comparator.naturalOrder()));
            case "author":
                return Comparator.comparing(Media::getAuthor, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            default:
                return Comparator.comparing(Media::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
        }
    }
    
    // Get unique genres for filter dropdown
    public List<String> getAllGenres() {
        return mediaRepository.findAll().stream()
            .map(Media::getGenre)
            .filter(genre -> genre != null && !genre.trim().isEmpty())
            .distinct()
            .sorted(String.CASE_INSENSITIVE_ORDER)
            .collect(Collectors.toList());
    }
    
    // Get unique authors for filter dropdown
    public List<String> getAllAuthors() {
        return mediaRepository.findAll().stream()
            .map(Media::getAuthor)
            .filter(author -> author != null && !author.trim().isEmpty())
            .distinct()
            .sorted(String.CASE_INSENSITIVE_ORDER)
            .collect(Collectors.toList());
    }
    
    // Get unique release years for filter dropdown
    public List<Integer> getAllReleaseYears() {
        return mediaRepository.findAll().stream()
            .map(Media::getReleaseYear)
            .filter(year -> year != null)
            .distinct()
            .sorted(Comparator.reverseOrder())
            .collect(Collectors.toList());
    }
}
