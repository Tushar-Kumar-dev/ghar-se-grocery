package com.sibms.service;

import java.util.Map;

public interface SettingService {
    Map<String, String> getAll();
    String get(String key);
    Map<String, String> updateAll(Map<String, String> updates);
}
