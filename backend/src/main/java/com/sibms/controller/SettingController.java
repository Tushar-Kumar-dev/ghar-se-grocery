package com.sibms.controller;

import com.sibms.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingController {

    private final SettingService settingService;

    @GetMapping
    public Map<String, String> getAll() {
        return settingService.getAll();
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> updateAll(@RequestBody Map<String, String> updates) {
        return settingService.updateAll(updates);
    }
}
