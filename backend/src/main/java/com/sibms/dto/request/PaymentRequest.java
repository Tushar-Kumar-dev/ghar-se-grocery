package com.sibms.dto.request;

import com.sibms.enums.PaymentMode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PaymentRequest(
    @NotNull PaymentMode mode,
    @NotNull @DecimalMin("0.01") BigDecimal amount
) {}
