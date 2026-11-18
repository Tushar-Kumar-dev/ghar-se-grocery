package com.sibms.controller;

import com.sibms.dto.request.CreateInvoiceRequest;
import com.sibms.dto.response.InvoiceResponse;
import com.sibms.dto.response.PageResponse;
import com.sibms.enums.InvoiceStatus;
import com.sibms.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public PageResponse<InvoiceResponse> search(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @ParameterObject @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return invoiceService.search(customerId, status, from, to, pageable);
    }

    @GetMapping("/{id}")
    public InvoiceResponse get(@PathVariable Long id) {
        return invoiceService.getById(id);
    }

    @GetMapping("/no/{invoiceNo}")
    public InvoiceResponse getByNo(@PathVariable String invoiceNo) {
        return invoiceService.getByInvoiceNo(invoiceNo);
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> create(@Valid @RequestBody CreateInvoiceRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.create(request, auth.getName()));
    }
}
