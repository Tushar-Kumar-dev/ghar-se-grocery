package com.sibms.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateOrderStatusRequest(
        @NotBlank String status, // PENDING_REVIEW, PACKING, OUT_FOR_DELIVERY, READY_FOR_PICKUP, COMPLETED, CANCELLED
        String note
) {}
