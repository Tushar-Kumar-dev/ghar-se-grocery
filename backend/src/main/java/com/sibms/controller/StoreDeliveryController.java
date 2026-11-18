package com.sibms.controller;

import com.sibms.dto.response.ApiResponse;
import com.sibms.entity.Setting;
import com.sibms.repository.SettingRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/store-delivery")
@RequiredArgsConstructor
@Tag(name = "Store Delivery Policy", description = "Store-level Home Delivery Switch & SLAs")
public class StoreDeliveryController {

    private final SettingRepository settingRepository;

    @GetMapping("/status")
    @Operation(summary = "Get Store Delivery Status & Policy (Public)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatus() {
        boolean active = getSettingBool("delivery_active", true);
        String storeName = getSettingStr("store_name", "Apna Bazar Supermarket");
        String address = getSettingStr("store_address", "Plot 42, Sector 12 Main Market, Dwarka, New Delhi");
        double lat = getSettingDouble("store_latitude", 28.5921);
        double lon = getSettingDouble("store_longitude", 77.0460);
        double minOrder = getSettingDouble("delivery_min_order", 499.0);
        double fee = getSettingDouble("delivery_fee", 30.0);
        double radius = getSettingDouble("delivery_radius_km", 10.0);
        int sla = getSettingInt("delivery_sla_mins", 35);

        Map<String, Object> data = new java.util.HashMap<>();
        data.put("active", active);
        data.put("storeName", storeName);
        data.put("address", address);
        data.put("latitude", lat);
        data.put("longitude", lon);
        data.put("minOrderValue", minOrder);
        data.put("deliveryFee", fee);
        data.put("maxRadiusKm", radius);
        data.put("avgSlaMins", sla);

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PutMapping("/toggle")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Master Home Delivery Service Toggle (Store Manager Only)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleDelivery(
            @RequestBody Map<String, Object> body) {
        Boolean active = (Boolean) body.getOrDefault("active", true);
        settingRepository.save(new Setting("delivery_active", String.valueOf(active)));

        return ResponseEntity.ok(ApiResponse.success(
                active ? "Home Delivery is now ACTIVE" : "Home Delivery PAUSED",
                Map.of("active", active)
        ));
    }

    @PutMapping("/policy")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update Store Delivery Policy (Min Order, Fee, Radius, SLA, GPS Coordinates)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updatePolicy(
            @RequestBody Map<String, Object> body) {
        if (body.containsKey("minOrderValue")) {
            settingRepository.save(new Setting("delivery_min_order", String.valueOf(body.get("minOrderValue"))));
        }
        if (body.containsKey("deliveryFee")) {
            settingRepository.save(new Setting("delivery_fee", String.valueOf(body.get("deliveryFee"))));
        }
        if (body.containsKey("maxRadiusKm")) {
            settingRepository.save(new Setting("delivery_radius_km", String.valueOf(body.get("maxRadiusKm"))));
        }
        if (body.containsKey("avgSlaMins")) {
            settingRepository.save(new Setting("delivery_sla_mins", String.valueOf(body.get("avgSlaMins"))));
        }
        if (body.containsKey("latitude")) {
            settingRepository.save(new Setting("store_latitude", String.valueOf(body.get("latitude"))));
        }
        if (body.containsKey("longitude")) {
            settingRepository.save(new Setting("store_longitude", String.valueOf(body.get("longitude"))));
        }
        if (body.containsKey("address")) {
            settingRepository.save(new Setting("store_address", String.valueOf(body.get("address"))));
        }
        if (body.containsKey("storeName")) {
            settingRepository.save(new Setting("store_name", String.valueOf(body.get("storeName"))));
        }

        return ResponseEntity.ok(ApiResponse.success("Store delivery policy and location updated successfully", body));
    }

    private boolean getSettingBool(String key, boolean def) {
        return settingRepository.findById(key)
                .map(s -> Boolean.parseBoolean(s.getValue()))
                .orElse(def);
    }

    private String getSettingStr(String key, String def) {
        return settingRepository.findById(key)
                .map(Setting::getValue)
                .orElse(def);
    }

    private double getSettingDouble(String key, double def) {
        return settingRepository.findById(key)
                .map(s -> {
                    try { return Double.parseDouble(s.getValue()); } catch (Exception e) { return def; }
                })
                .orElse(def);
    }

    private int getSettingInt(String key, int def) {
        return settingRepository.findById(key)
                .map(s -> {
                    try { return Integer.parseInt(s.getValue()); } catch (Exception e) { return def; }
                })
                .orElse(def);
    }
}
