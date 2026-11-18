package com.sibms.dto.response;

import com.sibms.entity.Payment;
import com.sibms.enums.PaymentMode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
    Long id,
    PaymentMode mode,
    BigDecimal amount,
    LocalDateTime paidAt) {

    public static PaymentResponse from(Payment p) {
        return new PaymentResponse(p.getId(), p.getMode(), p.getAmount(), p.getPaidAt());
    }
}
