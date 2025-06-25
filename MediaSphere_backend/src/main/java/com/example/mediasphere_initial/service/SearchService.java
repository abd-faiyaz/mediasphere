package com.example.mediasphere_initial.service;

import com.example.mediasphere_initial.model.User;
import com.example.mediasphere_initial.model.Club;
import com.example.mediasphere_initial.model.Media;
import com.example.mediasphere_initial.model.Thread;
import com.example.mediasphere_initial.model.MediaType;
import com.example.mediasphere_initial.repository.UserRepository;
import com.example.mediasphere_initial.repository.ClubRepository;
import com.example.mediasphere_initial.repository.MediaRepository;
import com.example.mediasphere_initial.repository.ThreadRepository;
import com.example.mediasphere_initial.repository.MediaTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class SearchService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private ThreadRepository threadRepository;

    @Autowired
    private MediaTypeRepository mediaTypeRepository;

    public Map<String, Object> searchAll(String keyword) {
        Map<String, Object> results = new HashMap<>();
        
        results.put("users", searchUsers(keyword));
        results.put("clubs", searchClubs(keyword));
        results.put("media", searchMedia(keyword, null));
        results.put("threads", searchThreads(keyword));
        
        return results;
    }

    public List<Club> searchClubs(String keyword) {
        return clubRepository.searchByNameOrDescription(keyword);
    }

    public List<Media> searchMedia(String keyword, String type) {
        if (type != null && !type.trim().isEmpty()) {
            // Find media type by name
            MediaType mediaType = mediaTypeRepository.findByTypeName(type)
                .orElse(null);
            if (mediaType != null) {
                return mediaRepository.searchByMediaTypeAndKeyword(mediaType, keyword);
            }
        }
        return mediaRepository.searchByTitleOrDescription(keyword);
    }

    public List<Thread> searchThreads(String keyword) {
        return threadRepository.searchByTitleOrContent(keyword);
    }

    public List<User> searchUsers(String keyword) {
        return userRepository.searchByUsernameOrEmail(keyword);
    }
}
