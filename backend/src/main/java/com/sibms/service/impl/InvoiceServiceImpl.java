package com.sibms.service.impl;

import com.sibms.dto.request.CreateInvoiceRequest;
import com.sibms.dto.request.InvoiceItemRequest;
import com.sibms.dto.request.PaymentRequest;
import com.sibms.dto.response.InvoiceResponse;
import com.sibms.dto.response.PageResponse;
import com.sibms.entity.*;
import com.sibms.enums.InvoiceStatus;
import com.sibms.enums.StockMovementType;
import com.sibms.exception.BadRequestException;
import com.sibms.exception.ResourceNotFoundException;
import com.sibms.repository.*;
import com.sibms.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final StockLedgerRepository stockLedgerRepository;
    private final SettingRepository settingRepository;

    @Override
    @Transactional
    public InvoiceResponse create(CreateInvoiceRequest req, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Customer customer = null;
        if (req.customerId() != null) {
            customer = customerRepository.findById(req.customerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + req.customerId()));
        }

        String prefix = settingRepository.findById("invoice_prefix")
                .map(Setting::getValue)
                .filter(p -> !p.isBlank())
                .orElse("INV");

        long nextId = invoiceRepository.findMaxId().orElse(0L) + 1;
        String invoiceNo = String.format("%s-%05d", prefix, nextId);

        BigDecimal invoiceDiscount = req.discount() != null ? req.discount() : BigDecimal.ZERO;

        Invoice invoice = Invoice.builder()
                .invoiceNo(invoiceNo)
                .customer(customer)
                .user(user)
                .subtotal(BigDecimal.ZERO)
                .discount(invoiceDiscount)
                .tax(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal taxTotal = BigDecimal.ZERO;

        for (InvoiceItemRequest itemReq : req.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.productId()));

            Stock stock = stockRepository.findByProductId(itemReq.productId())
                    .orElseThrow(() -> new BadRequestException("No stock record found for product: " + product.getName()));

            if (stock.getQuantity() < itemReq.qty()) {
                throw new BadRequestException("Insufficient stock for '" + product.getName() + "'. Available: " + stock.getQuantity() + ", requested: " + itemReq.qty());
            }

            BigDecimal discount = itemReq.discount() != null ? itemReq.discount() : BigDecimal.ZERO;
            BigDecimal gstPct = itemReq.gstPercent() != null ? itemReq.gstPercent() : product.getGstPercent();
            BigDecimal baseAmount = itemReq.rate().multiply(BigDecimal.valueOf(itemReq.qty())).subtract(discount);
            BigDecimal gstAmount = baseAmount.multiply(gstPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal amount = baseAmount.add(gstAmount);

            InvoiceItem item = InvoiceItem.builder()
                    .invoice(invoice)
                    .product(product)
                    .qty(itemReq.qty())
                    .rate(itemReq.rate())
                    .discount(discount)
                    .gstPercent(gstPct)
                    .amount(amount)
                    .build();

            invoice.getItems().add(item);

            // Deduct stock
            stock.setQuantity(stock.getQuantity() - itemReq.qty());
            stockRepository.save(stock);

            // Record in stock ledger
            stockLedgerRepository.save(StockLedger.builder()
                    .product(product)
                    .changeQty(-itemReq.qty())
                    .type(StockMovementType.SALE)
                    .reason("Invoice " + invoiceNo)
                    .user(user)
                    .build());

            subtotal = subtotal.add(itemReq.rate().multiply(BigDecimal.valueOf(itemReq.qty())));
            taxTotal = taxTotal.add(gstAmount);
        }

        BigDecimal total = subtotal.subtract(invoiceDiscount).add(taxTotal);
        invoice.setSubtotal(subtotal);
        invoice.setTax(taxTotal);
        invoice.setTotal(total.max(BigDecimal.ZERO));

        // Process payments
        BigDecimal totalPaid = BigDecimal.ZERO;
        if (req.payments() != null) {
            for (PaymentRequest pr : req.payments()) {
                Payment payment = Payment.builder()
                        .invoice(invoice)
                        .mode(pr.mode())
                        .amount(pr.amount())
                        .build();
                invoice.getPayments().add(payment);
                totalPaid = totalPaid.add(pr.amount());
            }
        }

        // Determine Invoice Status
        int cmp = totalPaid.compareTo(invoice.getTotal());
        if (cmp >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(InvoiceStatus.PARTIAL);
        } else {
            invoice.setStatus(InvoiceStatus.CREDIT);
        }

        // Update customer balance if credit/partial
        if (customer != null && cmp < 0) {
            BigDecimal remaining = invoice.getTotal().subtract(totalPaid);
            customer.setOutstandingBalance(customer.getOutstandingBalance().add(remaining));
            customerRepository.save(customer);
        }

        Invoice saved = invoiceRepository.save(invoice);
        return InvoiceResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InvoiceResponse> search(Long customerId, InvoiceStatus status, LocalDate from, LocalDate to, Pageable pageable) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDt = to != null ? to.plusDays(1).atStartOfDay() : null;
        return PageResponse.from(invoiceRepository.search(customerId, status, fromDt, toDt, pageable).map(InvoiceResponse::from));
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getById(Long id) {
        return InvoiceResponse.from(invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getByInvoiceNo(String invoiceNo) {
        return InvoiceResponse.from(invoiceRepository.findByInvoiceNo(invoiceNo.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with number " + invoiceNo)));
    }
}
