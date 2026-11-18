package com.sibms.service;
import com.sibms.dto.request.StockAdjustRequest;
import com.sibms.dto.response.PageResponse;
import com.sibms.dto.response.StockLedgerResponse;
import com.sibms.dto.response.StockResponse;
import org.springframework.data.domain.Pageable;
import java.util.List;
public interface StockService {
    StockResponse getByProduct(Long productId);
    PageResponse<StockResponse> listAll(Pageable pageable);
    List<StockResponse> getLowStock();
    StockResponse adjust(StockAdjustRequest request, String userEmail);
    PageResponse<StockLedgerResponse> getLedger(Long productId, Pageable pageable);
}
