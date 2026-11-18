package com.sibms.service;

import com.sibms.dto.request.CreateInvoiceRequest;
import com.sibms.dto.response.InvoiceResponse;
import com.sibms.dto.response.PageResponse;
import com.sibms.enums.InvoiceStatus;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface InvoiceService {
    InvoiceResponse create(CreateInvoiceRequest request, String userEmail);
    PageResponse<InvoiceResponse> search(Long customerId, InvoiceStatus status, LocalDate from, LocalDate to, Pageable pageable);
    InvoiceResponse getById(Long id);
    InvoiceResponse getByInvoiceNo(String invoiceNo);
}
