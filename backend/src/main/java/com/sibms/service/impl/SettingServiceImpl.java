package com.sibms.service.impl;

import com.sibms.entity.Setting;
import com.sibms.repository.SettingRepository;
import com.sibms.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettingServiceImpl implements SettingService {

    private final SettingRepository settingRepository;

    @Override
    @Transactional(readOnly = true)
    public Map<String, String> getAll() {
        return settingRepository.findAll().stream()
                .collect(Collectors.toMap(Setting::getKey, s -> s.getValue() != null ? s.getValue() : ""));
    }

    @Override
    @Transactional(readOnly = true)
    public String get(String key) {
        return settingRepository.findById(key).map(Setting::getValue).orElse(null);
    }

    @Override
    @Transactional
    public Map<String, String> updateAll(Map<String, String> updates) {
        updates.forEach((key, value) -> {
            Setting setting = settingRepository.findById(key)
                    .orElseGet(() -> new Setting(key, null));
            setting.setValue(value);
            settingRepository.save(setting);
        });
        return getAll();
    }
}
