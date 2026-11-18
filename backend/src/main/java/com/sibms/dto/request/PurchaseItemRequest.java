package com.sibms.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PurchaseItemRequest(
    @NotNull Long productId,
    @NotNull @Min(1) Integer qty,
    @NotNull @DecimalMin("0.0") BigDecimal costPrice
) {}
