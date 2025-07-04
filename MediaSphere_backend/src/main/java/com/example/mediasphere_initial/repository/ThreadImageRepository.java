package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.ThreadImage;
import com.example.mediasphere_initial.model.Thread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ThreadImageRepository extends JpaRepository<ThreadImage, UUID> {
    List<ThreadImage> findByThread(Thread thread);

    List<ThreadImage> findByThreadId(UUID threadId);

    void deleteByThread(Thread thread);
}
