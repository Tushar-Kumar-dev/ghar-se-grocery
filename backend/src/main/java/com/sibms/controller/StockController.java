package com.sibms.controller;
import com.sibms.dto.request.StockAdjustRequest;
import com.sibms.dto.response.PageResponse;
import com.sibms.dto.response.StockLedgerResponse;
import com.sibms.dto.response.StockResponse;
import com.sibms.service.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {
    private final StockService stockService;

    @GetMapping
    public PageResponse<StockResponse> listAll(
        @ParameterObject @PageableDefault(size = 20, sort = "product.name") Pageable pageable) {
        return stockService.listAll(pageable);
    }

    @GetMapping("/low")
    public List<StockResponse> getLowStock() { return stockService.getLowStock(); }

    @GetMapping("/product/{productId}")
    public StockResponse getByProduct(@PathVariable Long productId) {
        return stockService.getByProduct(productId);
    }

    @GetMapping("/product/{productId}/ledger")
    public PageResponse<StockLedgerResponse> getLedger(
        @PathVariable Long productId,
        @ParameterObject @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return stockService.getLedger(productId, pageable);
    }

    @PostMapping("/adjust")
    public StockResponse adjust(@Valid @RequestBody StockAdjustRequest request, Authentication auth) {
        String actor = (auth != null && auth.getName() != null) ? auth.getName() : "Store Manager";
        return stockService.adjust(request, actor);
    }
}
