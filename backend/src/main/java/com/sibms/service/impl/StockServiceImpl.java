package com.sibms.service.impl;
import com.sibms.dto.request.StockAdjustRequest;
import com.sibms.dto.response.PageResponse;
import com.sibms.dto.response.StockLedgerResponse;
import com.sibms.dto.response.StockResponse;
import com.sibms.entity.Product;
import com.sibms.entity.Stock;
import com.sibms.entity.StockLedger;
import com.sibms.entity.User;
import com.sibms.exception.BadRequestException;
import com.sibms.exception.ResourceNotFoundException;
import com.sibms.repository.ProductRepository;
import com.sibms.repository.StockLedgerRepository;
import com.sibms.repository.StockRepository;
import com.sibms.repository.UserRepository;
import com.sibms.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {
    private final StockRepository stockRepository;
    private final StockLedgerRepository ledgerRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override @Transactional(readOnly = true)
    public StockResponse getByProduct(Long productId) {
        return StockResponse.from(findStock(productId));
    }

    @Override @Transactional(readOnly = true)
    public PageResponse<StockResponse> listAll(Pageable pageable) {
        return PageResponse.from(stockRepository.findAll(pageable).map(StockResponse::from));
    }

    @Override @Transactional(readOnly = true)
    public List<StockResponse> getLowStock() {
        return stockRepository.findLowStock().stream().map(StockResponse::from).toList();
    }

    @Override @Transactional
    public StockResponse adjust(StockAdjustRequest request, String userEmail) {
        Product product = productRepository.findById(request.productId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        Stock stock = stockRepository.findByProductId(request.productId())
            .orElseGet(() -> Stock.builder().product(product).quantity(0).build());

        int newQty = stock.getQuantity() + request.changeQty();
        if (newQty < 0)
            throw new BadRequestException("Insufficient stock. Available: " + stock.getQuantity());
        stock.setQuantity(newQty);
        stockRepository.save(stock);

        User user = userRepository.findByEmail(userEmail).orElse(null);
        ledgerRepository.save(StockLedger.builder()
            .product(product).changeQty(request.changeQty())
            .type(request.type()).reason(request.reason()).user(user).build());

        return StockResponse.from(stock);
    }

    @Override @Transactional(readOnly = true)
    public PageResponse<StockLedgerResponse> getLedger(Long productId, Pageable pageable) {
        return PageResponse.from(ledgerRepository.findByProductId(productId, pageable).map(StockLedgerResponse::from));
    }

    private Stock findStock(Long productId) {
        return stockRepository.findByProductId(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Stock not found for product " + productId));
    }
}
