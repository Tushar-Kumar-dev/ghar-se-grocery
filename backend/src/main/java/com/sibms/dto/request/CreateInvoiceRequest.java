package com.sibms.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.math.BigDecimal;
import java.util.List;

public record CreateInvoiceRequest(
    Long customerId,
    @NotEmpty @Valid List<InvoiceItemRequest> items,
    BigDecimal discount,
    @Valid List<PaymentRequest> payments
) {}
