package com.sibms.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record InvoiceItemRequest(
    @NotNull Long productId,
    @NotNull @Min(1) Integer qty,
    @NotNull @DecimalMin("0.0") BigDecimal rate,
    @DecimalMin("0.0") BigDecimal discount,
    @DecimalMin("0.0") @DecimalMax("100.0") BigDecimal gstPercent
) {}
