package com.sibms.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record CreateCustomerOrderRequest(
        String orderNumber,
        String storeName,
        @NotBlank String customerName,
        @NotBlank String customerPhone,
        @NotBlank String fulfillmentMode, // delivery or pickup
        @NotBlank String deliveryAddress,
        String listType, // photo or manual
        String parchiImageUrl,
        String itemsSummary,
        String itemsJson,
        BigDecimal estimatedTotal
) {}
