package com.sibms.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record UpdateCategoryRequest(
    @NotBlank @Size(max = 100) String name,
    Long parentId,
    boolean active
) {}
