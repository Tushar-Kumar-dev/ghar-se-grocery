package com.sibms.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record UpdateProductRequest(
    @NotBlank @Size(max = 200) String name,
    @Size(max = 100) String brand,
    Long categoryId,
    @NotBlank @Size(max = 20) String unit,
    @Size(max = 50) String pack,
    @NotNull @DecimalMin("0.0") BigDecimal costPrice,
    @NotNull @DecimalMin("0.0") BigDecimal sellingPrice,
    @NotNull @DecimalMin("0.0") @DecimalMax("100.0") BigDecimal gstPercent,
    @Min(0) int minStock,
    boolean expiryTracking,
    boolean active
) {}
