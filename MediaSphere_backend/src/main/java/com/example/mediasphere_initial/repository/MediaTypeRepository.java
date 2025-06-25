package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.MediaType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface MediaTypeRepository extends JpaRepository<MediaType, UUID> {
    @Query("SELECT mt FROM MediaType mt WHERE LOWER(mt.name) = LOWER(:typeName)")
    Optional<MediaType> findByTypeName(@Param("typeName") String typeName);
    
    boolean existsByName(String name);
}
