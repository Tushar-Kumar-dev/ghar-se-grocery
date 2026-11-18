package com.sibms.config;

import com.sibms.entity.Category;
import com.sibms.entity.Setting;
import com.sibms.entity.User;
import com.sibms.enums.Role;
import com.sibms.repository.CategoryRepository;
import com.sibms.repository.SettingRepository;
import com.sibms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Application seed: Sirf Store Manager ka account create karta hai. Baaki sab data scratch se banaya jayega. */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SettingRepository settingRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Only Store Manager Seed
        createIfMissing("Rajesh Kumar (Manager)", "manager@sibms.com", "admin123", Role.MANAGER);

        // 2. Store Delivery Settings
        initSettingIfMissing("delivery_active", "true");
        initSettingIfMissing("delivery_min_order", "499");
        initSettingIfMissing("delivery_fee", "30");
        initSettingIfMissing("delivery_radius_km", "4.5");
        initSettingIfMissing("delivery_sla_mins", "35");
        initSettingIfMissing("store_name", "Apna Bazar Supermarket");

        // 3. Baseline Retail Grocery Categories
        seedDefaultCategories();
    }

    private void seedDefaultCategories() {
        String[] defaults = {
            "Flours & Rice", "Dals & Pulses", "Oils & Ghee", "Dairy & Spreads",
            "Spices & Masala", "Tea & Coffee", "Packaged Food", "Biscuits & Snacks",
            "Beverages & Cold Drinks", "Household & Cleaning", "Personal Care", "General Grocery"
        };
        for (String catName : defaults) {
            if (!categoryRepository.existsByName(catName)) {
                categoryRepository.save(Category.builder()
                        .name(catName)
                        .active(true)
                        .build());
                log.info("Seeded default grocery category: {}", catName);
            }
        }
    }

    private void createIfMissing(String name, String email, String rawPassword, Role role) {
        String normalized = email.trim().toLowerCase();
        if (userRepository.existsByEmail(normalized)) {
            return;
        }
        userRepository.save(User.builder()
                .name(name)
                .email(normalized)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(role)
                .build());
        log.info("Seeded sole Store Manager account: {}", normalized);
    }

    private void initSettingIfMissing(String key, String defaultValue) {
        if (!settingRepository.existsById(key)) {
            settingRepository.save(new Setting(key, defaultValue));
        }
    }
}
