package com.sibms.dto.response;

import com.sibms.entity.InvoiceItem;

import java.math.BigDecimal;

public record InvoiceItemResponse(
    Long id,
    Long productId,
    String productName,
    String productSku,
    int qty,
    BigDecimal rate,
    BigDecimal discount,
    BigDecimal gstPercent,
    BigDecimal amount) {

    public static InvoiceItemResponse from(InvoiceItem i) {
        return new InvoiceItemResponse(
                i.getId(),
                i.getProduct().getId(),
                i.getProduct().getName(),
                i.getProduct().getSku(),
                i.getQty(),
                i.getRate(),
                i.getDiscount(),
                i.getGstPercent(),
                i.getAmount());
    }
}
