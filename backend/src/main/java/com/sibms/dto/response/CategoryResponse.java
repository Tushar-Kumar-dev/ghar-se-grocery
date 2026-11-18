package com.sibms.dto.response;
import com.sibms.entity.Category;
public record CategoryResponse(Long id, String name, Long parentId, String parentName, boolean active) {
    public static CategoryResponse from(Category c) {
        return new CategoryResponse(c.getId(), c.getName(),
            c.getParent() != null ? c.getParent().getId() : null,
            c.getParent() != null ? c.getParent().getName() : null,
            c.isActive());
    }
}
