package com.techlearn.repository;

import com.techlearn.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u ORDER BY u.xp DESC LIMIT :limit")
    List<User> findTopByXp(int limit);

    @Modifying
    @Query("UPDATE User u SET u.streak = 0 WHERE u.lastActiveAt < CURRENT_TIMESTAMP - 1 DAY")
    int resetInactiveStreaks();
}
