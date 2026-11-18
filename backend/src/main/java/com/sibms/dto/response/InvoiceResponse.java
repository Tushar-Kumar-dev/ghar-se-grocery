package com.sibms.dto.response;

import com.sibms.entity.Invoice;
import com.sibms.enums.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record InvoiceResponse(
    Long id,
    String invoiceNo,
    Long customerId,
    String customerName,
    Long userId,
    String userName,
    BigDecimal subtotal,
    BigDecimal discount,
    BigDecimal tax,
    BigDecimal total,
    InvoiceStatus status,
    LocalDateTime createdAt,
    List<InvoiceItemResponse> items,
    List<PaymentResponse> payments) {

    public static InvoiceResponse from(Invoice inv) {
        return new InvoiceResponse(
                inv.getId(),
                inv.getInvoiceNo(),
                inv.getCustomer() != null ? inv.getCustomer().getId() : null,
                inv.getCustomer() != null ? inv.getCustomer().getName() : null,
                inv.getUser().getId(),
                inv.getUser().getName(),
                inv.getSubtotal(),
                inv.getDiscount(),
                inv.getTax(),
                inv.getTotal(),
                inv.getStatus(),
                inv.getCreatedAt(),
                inv.getItems().stream().map(InvoiceItemResponse::from).toList(),
                inv.getPayments().stream().map(PaymentResponse::from).toList());
    }
}
