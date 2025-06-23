package com.example.mediasphere_initial.repository;

import com.example.mediasphere_initial.model.Club;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ClubRepository extends JpaRepository<Club, UUID> {
}