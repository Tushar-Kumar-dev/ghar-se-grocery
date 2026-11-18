-- Migration V2: Customer orders table & Delivery settings

CREATE TABLE IF NOT EXISTS customer_orders (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number      VARCHAR(50)   NOT NULL UNIQUE,
    store_name        VARCHAR(100)  NOT NULL DEFAULT 'Apna Bazar Supermarket',
    customer_name     VARCHAR(100)  NOT NULL,
    customer_phone    VARCHAR(20)   NOT NULL,
    fulfillment_mode  VARCHAR(20)   NOT NULL DEFAULT 'delivery',
    delivery_address  TEXT          NOT NULL,
    list_type         VARCHAR(30)   NOT NULL DEFAULT 'Manual Items',
    parchi_image_url  LONGTEXT      NULL,
    items_summary     TEXT          NULL,
    items_json        LONGTEXT      NULL,
    estimated_total   DECIMAL(12,2) NOT NULL DEFAULT 540.00,
    status            VARCHAR(30)   NOT NULL DEFAULT 'PENDING_REVIEW',
    placed_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_orders_phone ON customer_orders (customer_phone);
CREATE INDEX idx_customer_orders_status ON customer_orders (status);

-- Seed initial store delivery settings
INSERT IGNORE INTO settings (setting_key, setting_value) VALUES
    ('delivery_active', 'true'),
    ('delivery_min_order', '499'),
    ('delivery_fee', '30'),
    ('delivery_radius_km', '4.5'),
    ('delivery_sla_mins', '35'),
    ('store_name', 'Apna Bazar Supermarket');
