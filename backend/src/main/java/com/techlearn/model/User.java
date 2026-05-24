package com.techlearn.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email", unique = true)
})
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.STUDENT;

    @Column(nullable = false)
    private int xp = 0;

    @Column(nullable = false)
    private int streak = 0;

    @Column(nullable = false)
    private int level = 1;

    @Column(name = "last_active_at")
    private LocalDateTime lastActiveAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "refresh_token")
    private String refreshToken;

    @Column(name = "is_active")
    private boolean isActive = true;

    public enum Role { STUDENT, INSTRUCTOR, ADMIN }

    // ─── Constructors ────────────────────────────────────────────────────────
    public User() {
    }

    public User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = Role.STUDENT;
        this.xp = 0;
        this.streak = 0;
        this.level = 1;
        this.createdAt = LocalDateTime.now();
        this.isActive = true;
    }

    // ─── Getters and Setters ──────────────────────────────────────────────────
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public int getXp() { return xp; }
    public void setXp(int xp) { this.xp = xp; }

    public int getStreak() { return streak; }
    public void setStreak(int streak) { this.streak = streak; }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }

    public LocalDateTime getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(LocalDateTime lastActiveAt) { this.lastActiveAt = lastActiveAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    // ─── UserDetails ──────────────────────────────────────────────────────────
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return isActive; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return isActive; }

    // XP and level up logic
    public void addXp(int points) {
        this.xp += points;
        this.level = (this.xp / 500) + 1; // every 500 XP = 1 level
    }

    // ─── Builder pattern ──────────────────────────────────────────────────────
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private UUID id;
        private String name;
        private String email;
        private String password;
        private String avatarUrl;
        private Role role = Role.STUDENT;
        private int xp = 0;
        private int streak = 0;
        private int level = 1;
        private LocalDateTime lastActiveAt;
        private LocalDateTime createdAt = LocalDateTime.now();
        private String refreshToken;
        private boolean isActive = true;

        public UserBuilder id(UUID id) { this.id = id; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public UserBuilder role(Role role) { this.role = role; return this; }
        public UserBuilder xp(int xp) { this.xp = xp; return this; }
        public UserBuilder streak(int streak) { this.streak = streak; return this; }
        public UserBuilder level(int level) { this.level = level; return this; }
        public UserBuilder lastActiveAt(LocalDateTime lastActiveAt) { this.lastActiveAt = lastActiveAt; return this; }
        public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UserBuilder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }
        public UserBuilder isActive(boolean isActive) { this.isActive = isActive; return this; }

        public User build() {
            User user = new User();
            user.id = this.id;
            user.name = this.name;
            user.email = this.email;
            user.password = this.password;
            user.avatarUrl = this.avatarUrl;
            user.role = this.role;
            user.xp = this.xp;
            user.streak = this.streak;
            user.level = this.level;
            user.lastActiveAt = this.lastActiveAt;
            user.createdAt = this.createdAt;
            user.refreshToken = this.refreshToken;
            user.isActive = this.isActive;
            return user;
        }
    }
}
